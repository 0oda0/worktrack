import { Request, Response, NextFunction } from 'express';
import { ROLES } from '../config/constants';
import { User } from '../models';

export const requireRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    if (roles.includes(user.role)) {
      next();
    } else {
      res.status(403).json({ error: 'Forbidden' });
    }
  };
};

// Проверка доступа к данным конкретного пользователя или записи
export const checkAudienceAccess = async (req: Request, res: Response, next: NextFunction) => {
  const currentUser = (req as any).user;
  if (!currentUser) return res.status(401).json({ error: 'Unauthorized' });

  // Администратор имеет доступ ко всем
  if (currentUser.role === ROLES.ADMIN) return next();

  // Получаем целевой userId из параметров или тела запроса
  let targetUserId: number | undefined = parseInt(req.params.userId) || parseInt(req.params.id);
  if (!targetUserId && req.method === 'GET') {
    // Для GET-запросов, если нет userId, то это запрос своего табеля – разрешаем
    if (req.path.includes('/timesheet') && !req.params.userId) {
      return next();
    }
  }
  if (!targetUserId && req.body.userId) {
    targetUserId = parseInt(req.body.userId);
  }
  if (!targetUserId && req.query.userId) {
    targetUserId = parseInt(req.query.userId as string);
  }

  // Если не указан конкретный пользователь – считаем, что запрос к своим данным
  if (!targetUserId) {
    // разрешаем доступ к себе
    return next();
  }

  // Если текущий пользователь – лидер, проверяем, что целевой пользователь в его аудитории
  if (currentUser.role === ROLES.LEADER) {
    const targetUser = await User.findByPk(targetUserId);
    if (!targetUser) return res.status(404).json({ error: 'User not found' });
    if (targetUser.audience === currentUser.audience) {
      return next();
    } else {
      return res.status(403).json({ error: 'Access denied' });
    }
  }

  // Обычный работник может видеть только себя
  if (currentUser.role === ROLES.WORKER) {
    if (targetUserId === currentUser.id) {
      return next();
    } else {
      return res.status(403).json({ error: 'Access denied' });
    }
  }

  return res.status(403).json({ error: 'Access denied' });
};