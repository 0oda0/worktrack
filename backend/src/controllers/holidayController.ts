import { Request, Response } from 'express';
import { Holiday } from '../models';

export const getHolidays = async (req: Request, res: Response) => {
  const holidays = await Holiday.findAll({ order: [['date', 'ASC']] });
  res.json(holidays);
};

export const createHoliday = async (req: Request, res: Response) => {
  const { date, name } = req.body;
  if (!date || !name) return res.status(400).json({ error: 'Date and name required' });
  try {
    const holiday = await Holiday.create({ date, name });
    res.status(201).json(holiday);
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
};

export const updateHoliday = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { date, name } = req.body;
  const holiday = await Holiday.findByPk(id);
  if (!holiday) return res.status(404).json({ error: 'Holiday not found' });
  await holiday.update({ date, name });
  res.json(holiday);
};

export const deleteHoliday = async (req: Request, res: Response) => {
  const { id } = req.params;
  const holiday = await Holiday.findByPk(id);
  if (!holiday) return res.status(404).json({ error: 'Holiday not found' });
  await holiday.destroy();
  res.status(204).send();
};