import { WorkRequest, AttendanceRecord, User } from '../models';
import { Op } from 'sequelize';

export const createRequest = async (data: any) => {
  const { userId, date, checkIn, checkOut, location, comment } = data;
  // проверка, что checkIn <= checkOut и дата корректна
  return await WorkRequest.create({ userId, date, checkIn, checkOut, location, comment });
};

export const approveRequest = async (requestId: number, reviewerId: number) => {
  const request = await WorkRequest.findByPk(requestId);
  if (!request) throw new Error('Запрос не найден');
  if (request.status !== 'pending') throw new Error('Запрос уже обработан');

  // Создаём или обновляем запись в AttendanceRecord
  const [record, created] = await AttendanceRecord.findOrCreate({
    where: { userId: request.userId, date: request.date },
    defaults: {
      userId: request.userId,
      date: request.date,
      checkIn: request.checkIn,
      checkOut: request.checkOut,
      locationIn: request.location,
      locationOut: request.location,
      isManual: true,
      verified: true,
      comment: request.comment,
    },
  });
  if (!created) {
    // обновляем существующую
    await record.update({
      checkIn: request.checkIn,
      checkOut: request.checkOut,
      locationIn: request.location,
      locationOut: request.location,
      isManual: true,
      verified: true,
      comment: request.comment,
    });
  }

  await request.update({ status: 'approved', reviewedBy: reviewerId });
  return request;
};