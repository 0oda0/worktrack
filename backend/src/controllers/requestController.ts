import { Request, Response } from 'express';
import { WorkRequest } from '../models';

export const getRequests = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const userRole = (req as any).user.role;
  
  let where = {};
  if (userRole === 'worker') {
    where = { userId };
  }
  // Для leader и admin — все запросы (можно добавить фильтр по аудитории)
  
  const requests = await WorkRequest.findAll({ 
    where,
    order: [['createdAt', 'DESC']]
  });
  res.json(requests);
};

export const createRequest = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { date, checkIn, checkOut, location, comment } = req.body;
  
  const request = await WorkRequest.create({
    userId,
    date,
    checkIn,
    checkOut,
    location,
    comment,
    status: 'pending'
  });
  res.status(201).json(request);
};

export const approveRequest = async (req: Request, res: Response) => {
  const { id } = req.params;
  const reviewerId = (req as any).user.id;
  
  const request = await WorkRequest.findByPk(id);
  if (!request) return res.status(404).json({ error: 'Запрос не найден' });
  if (request.status !== 'pending') return res.status(400).json({ error: 'Запрос уже обработан' });
  
  // Здесь можно добавить логику создания/обновления AttendanceRecord
  await request.update({ status: 'approved', reviewedBy: reviewerId });
  res.json(request);
};

export const rejectRequest = async (req: Request, res: Response) => {
  const { id } = req.params;
  const reviewerId = (req as any).user.id;
  const { reviewComment } = req.body;
  
  const request = await WorkRequest.findByPk(id);
  if (!request) return res.status(404).json({ error: 'Запрос не найден' });
  if (request.status !== 'pending') return res.status(400).json({ error: 'Запрос уже обработан' });
  
  await request.update({ 
    status: 'rejected', 
    reviewedBy: reviewerId,
    reviewComment: reviewComment || 'Отклонено'
  });
  res.json(request);
};