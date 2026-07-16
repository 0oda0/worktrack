import { Router } from 'express';
import authRoutes from './authRoutes';
import attendanceRoutes from './attendanceRoutes';
import requestRoutes from './requestRoutes';
import adminRoutes from './adminRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/requests', requestRoutes);
router.use('/admin', adminRoutes);

export default router;