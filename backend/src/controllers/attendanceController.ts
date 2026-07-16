import { Request, Response } from 'express';
import { AttendanceRecord, User } from '../models';
import { getStats, getDetailedDays } from '../services/attendanceService';

export const checkIn = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { lat, lng } = req.body;
  if (!lat || !lng) return res.status(400).json({ error: 'Геолокация обязательна' });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const existing = await AttendanceRecord.findOne({
    where: { userId, date: today, checkOut: null },
  });
  if (existing) return res.status(400).json({ error: 'Вы уже отметились сегодня' });

  const record = await AttendanceRecord.create({
    userId,
    date: today,
    checkIn: new Date(),
    locationIn: { lat, lng },
    isManual: false,
    verified: true,
  });
  res.status(201).json(record);
};

export const checkOut = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { lat, lng } = req.body;
  if (!lat || !lng) return res.status(400).json({ error: 'Геолокация обязательна' });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const record = await AttendanceRecord.findOne({
    where: { userId, date: today, checkOut: null },
  });
  if (!record) return res.status(400).json({ error: 'Нет активной отметки прихода' });

  record.checkOut = new Date();
  record.locationOut = { lat, lng };
  await record.save();
  res.json(record);
};

export const getTimesheet = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { start, end } = req.query;
  const startDate = start ? new Date(start as string) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const endDate = end ? new Date(end as string) : new Date();

  const stats = await getStats(userId, startDate, endDate);
  const days = await getDetailedDays(userId, startDate, endDate);
  res.json({ stats, days });
};

// Редактирование записи (для руководителя/админа)
export const updateRecord = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { checkIn, checkOut, comment } = req.body;
  const record = await AttendanceRecord.findByPk(id);
  if (!record) return res.status(404).json({ error: 'Запись не найдена' });
  await record.update({ checkIn, checkOut, comment });
  res.json(record);
};

export const deleteRecord = async (req: Request, res: Response) => {
  const { id } = req.params;
  const record = await AttendanceRecord.findByPk(id);
  if (!record) return res.status(404).json({ error: 'Запись не найдена' });
  await record.destroy();
  res.status(204).send();
};

export const getTimesheetForUser = async (req: Request, res: Response) => {
  const targetUserId = parseInt(req.params.userId);
  const { start, end } = req.query;
  
  const startDate = start ? new Date(start as string) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const endDate = end ? new Date(end as string) : new Date();
  
  const stats = await getStats(targetUserId, startDate, endDate);
  const days = await getDetailedDays(targetUserId, startDate, endDate);
  res.json({ stats, days });
};