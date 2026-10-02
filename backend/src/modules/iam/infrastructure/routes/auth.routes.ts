import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { LoginUseCase } from '../../application/usecases/LoginUseCase';
import { RegisterUseCase } from '../../application/usecases/RegisterUseCase';
import { GetProfileUseCase } from '../../application/usecases/GetProfileUseCase';
import { ListUsersUseCase } from '../../application/usecases/ListUsersUseCase';
import { PostgresUserRepository } from '../adapters/PostgresUserRepository';
import { pgPool } from '../../../../shared/database/postgres';
import { authMiddleware } from '../../../../shared/middleware/auth.middleware';
import { requireRole } from '../../../../shared/middleware/rbac.middleware';

const router = Router();
const userRepository = new PostgresUserRepository(pgPool);
const authController = new AuthController(
  new LoginUseCase(userRepository),
  new RegisterUseCase(userRepository),
  new GetProfileUseCase(userRepository),
  new ListUsersUseCase(userRepository)
);

// Public
router.post('/login', (req, res, next) => authController.login(req, res, next));

// Protected
router.get('/profile', authMiddleware, (req, res, next) => authController.profile(req, res, next));

// Gerente only
router.post('/register', authMiddleware, requireRole('GERENTE'), (req, res, next) => authController.register(req, res, next));
router.get('/users', authMiddleware, requireRole('GERENTE'), (req, res, next) => authController.list(req, res, next));

export default router;
