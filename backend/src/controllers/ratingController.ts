import { Request, Response } from 'express';
import { User, AttendanceRecord, WorkRequest } from '../models';
import { Op } from 'sequelize';
import { ROLES } from '../config/constants';

export const getRating = async (req: Request, res: Response) => {
  // За период (по умолчанию последние 30 дней)
  const { start, end } = req.query;
  const startDate = start ? new Date(start as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const endDate = end ? new Date(end as string) : new Date();

  // Получаем всех работников (не админов и не лидеров) – можно настроить
  const users = await User.findAll({
    where: { role: ROLES.WORKER },
    attributes: ['id', 'fullName', 'audience'],
  });

  const ratingData = [];
  for (const user of users) {
    // Общее количество отработанных часов (за период)
    const records = await AttendanceRecord.findAll({
      where: {
        userId: user.id,
        date: { [Op.between]: [startDate, endDate] },
        verified: true,
      },
    });
    let totalHours = 0;
    let overtimes = 0;
    let lateness = 0;
    for (const rec of records) {
      if (!rec.checkOut) continue;
      const dur = (rec.checkOut.getTime() - rec.checkIn.getTime()) / (1000 * 60 * 60);
      totalHours += dur;
      // переработка (только в рабочие дни, без выходных)
      const isWeekend = await isWeekendOrHoliday(rec.date);
      if (!isWeekend && dur > 9) overtimes += (dur - 9);
      // опоздание: если checkIn позже 9:00 (только рабочие дни)
      if (!isWeekend) {
        const hour = rec.checkIn.getHours();
        const minute = rec.checkIn.getMinutes();
        if (hour > 9 || (hour === 9 && minute > 0)) lateness++;
      }
    }
    // Количество утверждённых ручных запросов
    const approvedRequests = await WorkRequest.count({
      where: { userId: user.id, status: 'approved' },
    });
    // Суммарный балл (веса можно вынести в настройки)
    const score = (overtimes * 2) + (totalHours * 0.1) + (approvedRequests * 1) - (lateness * 3);
    ratingData.push({
      userId: user.id,
      fullName: user.fullName,
      audience: user.audience,
      totalHours: Math.round(totalHours * 100) / 100,
      overtimes: Math.round(overtimes * 100) / 100,
      lateness,
      approvedRequests,
      score: Math.round(score * 100) / 100,
    });
  }

  // Сортировка по убыванию score
  ratingData.sort((a, b) => b.score - a.score);
  res.json(ratingData);
};

// Вспомогательная функция (можно вынести в utils)
async function isWeekendOrHoliday(date: Date): Promise<boolean> {
  const day = date.getDay();
  if (day === 0 || day === 6) return true;
  const { Holiday } = require('../models');
  const holiday = await Holiday.findOne({ where: { date } });
  return !!holiday;
}