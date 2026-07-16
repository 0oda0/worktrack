import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { requireRole, checkAudienceAccess } from '../middleware/roleCheck';
import { 
  checkIn, 
  checkOut, 
  getTimesheet, 
  getTimesheetForUser,
  updateRecord, 
  deleteRecord 
} from '../controllers/attendanceController';
import { ROLES } from '../config/constants';

const router = Router();

router.use(authMiddleware);

router.post('/check-in', checkIn);
router.post('/check-out', checkOut);
router.get('/timesheet', getTimesheet);
router.put('/record/:id', requireRole(ROLES.ADMIN, ROLES.LEADER), updateRecord);
router.delete('/record/:id', requireRole(ROLES.ADMIN, ROLES.LEADER), deleteRecord);
router.get('/timesheet/:userId', requireRole(ROLES.ADMIN, ROLES.LEADER), checkAudienceAccess, getTimesheetForUser);

export default router;