import { Op } from 'sequelize';
import { User, AttendanceRecord, Holiday } from '../models';
import { WORK_DAY_HOURS, PAID_DAY_HOURS } from '../config/constants';
import { isWeekendOrHoliday, getWorkingDaysCount } from '../utils/dateHelpers';

export const getStats = async (userId: number, startDate: Date, endDate: Date) => {
  const records = await AttendanceRecord.findAll({
    where: {
      userId,
      date: { [Op.between]: [startDate, endDate] },
      verified: true,
    },
  });

  let totalHours = 0;
  let weekendHours = 0;
  let overtime = 0;
  let workingDays = getWorkingDaysCount(startDate, endDate); // утилита, считает будни без праздников

  for (const rec of records) {
    if (!rec.checkOut) continue;
    const dur = (rec.checkOut.getTime() - rec.checkIn.getTime()) / (1000 * 60 * 60);
    totalHours += dur;

    if (await isWeekendOrHoliday(rec.date)) {
      weekendHours += dur;
    } else {
      if (dur > WORK_DAY_HOURS) {
        overtime += (dur - WORK_DAY_HOURS);
      }
    }
  }

  const workNorm = workingDays * WORK_DAY_HOURS;
  const paidNorm = workingDays * PAID_DAY_HOURS;

  return {
    totalHours: Math.round(totalHours * 100) / 100,
    workHours: workNorm,
    paidHours: paidNorm,
    overtime: Math.round(overtime * 100) / 100,
    weekendHours: Math.round(weekendHours * 100) / 100,
  };
};

export const getDetailedDays = async (userId: number, startDate: Date, endDate: Date) => {
  const records = await AttendanceRecord.findAll({
    where: {
      userId,
      date: { [Op.between]: [startDate, endDate] },
      verified: true,
    },
    order: [['date', 'ASC']],
  });

  return Promise.all(records.map(async (rec) => {
    const isWeekend = await isWeekendOrHoliday(rec.date);
    const duration = rec.checkOut ? (rec.checkOut.getTime() - rec.checkIn.getTime()) / (1000 * 60 * 60) : 0;
    return {
      date: rec.date,
      checkIn: rec.checkIn,
      checkOut: rec.checkOut,
      duration: Math.round(duration * 100) / 100,
      isWeekend,
      locationIn: rec.locationIn,
      locationOut: rec.locationOut,
    };
  }));
};