import { Request, Response } from 'express';
import { User } from '../models';
import bcrypt from 'bcryptjs';

export const getUsers = async (req: Request, res: Response) => {
  const users = await User.findAll({ attributes: { exclude: ['password'] } });
  res.json(users);
};

export const createUser = async (req: Request, res: Response) => {
  const { fullName, email, password, role, audience, hireDate } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ fullName, email, password: hashed, role, audience, hireDate });
  res.status(201).json({ id: user.id, fullName, email, role, audience, hireDate });
};

export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { fullName, email, password, role, audience, hireDate } = req.body;
  const user = await User.findByPk(id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const updateData: any = { fullName, email, role, audience, hireDate };
  if (password) updateData.password = await bcrypt.hash(password, 10);
  await user.update(updateData);
  res.json({ id: user.id, fullName, email, role, audience, hireDate });
};

export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await User.findByPk(id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  await user.destroy();
  res.status(204).send();
};