import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { requireRole, checkAudienceAccess } from '../middleware/roleCheck';
import { ROLES } from '../config/constants';
import { getHolidays, createHoliday, updateHoliday, deleteHoliday } from '../controllers/holidayController';
import { getRating } from '../controllers/ratingController';
import { exportExcel, exportPDF } from '../controllers/exportController';
import { getUsers, createUser, updateUser, deleteUser } from '../controllers/adminController';

const router = Router();

router.use(authMiddleware);
// Все маршруты ниже доступны только админам или лидерам (частично)
// но мы добавим отдельные проверки

// Управление праздниками – только админ
router.get('/holidays', requireRole(ROLES.ADMIN), getHolidays);
router.post('/holidays', requireRole(ROLES.ADMIN), createHoliday);
router.put('/holidays/:id', requireRole(ROLES.ADMIN), updateHoliday);
router.delete('/holidays/:id', requireRole(ROLES.ADMIN), deleteHoliday);

// Рейтинг – доступен всем аутентифицированным (покажем всем)
router.get('/rating', getRating);

// Экспорт – доступен админам и лидерам (с проверкой доступа к данным)
router.get('/export/excel', requireRole(ROLES.ADMIN, ROLES.LEADER), checkAudienceAccess, exportExcel);
router.get('/export/pdf', requireRole(ROLES.ADMIN, ROLES.LEADER), checkAudienceAccess, exportPDF);

router.get('/users', requireRole(ROLES.ADMIN), getUsers);
router.post('/users', requireRole(ROLES.ADMIN), createUser);
router.put('/users/:id', requireRole(ROLES.ADMIN), updateUser);
router.delete('/users/:id', requireRole(ROLES.ADMIN), deleteUser);

export default router;