import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { requireRole } from '../middleware/roleCheck';
import { 
  getRequests, 
  createRequest, 
  approveRequest, 
  rejectRequest 
} from '../controllers/requestController';
import { ROLES } from '../config/constants';

const router = Router();

router.use(authMiddleware);

router.get('/', getRequests);
router.post('/', createRequest);
router.put('/:id/approve', requireRole(ROLES.ADMIN, ROLES.LEADER), approveRequest);
router.put('/:id/reject', requireRole(ROLES.ADMIN, ROLES.LEADER), rejectRequest);

export default router;