import { Request, Response } from 'express';
import { User } from '../models';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const register = async (req: Request, res: Response) => {
  try {
    const { fullName, email, password, role, audience, hireDate } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ fullName, email, password: hashed, role, audience, hireDate });
    res.status(201).json({ id: user.id, email: user.email, role: user.role });
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ error: 'User not found' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid password' });
    const token = jwt.sign(
      { id: user.id, role: user.role, audience: user.audience },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );
    res.json({ token, user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role, audience: user.audience } });
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
};