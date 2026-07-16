import { Holiday } from '../models';

export const isWeekendOrHoliday = async (date: Date): Promise<boolean> => {
  const day = date.getDay();
  if (day === 0 || day === 6) return true;
  const holiday = await Holiday.findOne({ where: { date } });
  return !!holiday;
};

export const getWorkingDaysCount = (start: Date, end: Date): number => {
  let count = 0;
  const current = new Date(start);
  while (current <= end) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) {
      // здесь нужно исключить праздники – для простоты не проверяем, можно дополнить
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  return count;
};