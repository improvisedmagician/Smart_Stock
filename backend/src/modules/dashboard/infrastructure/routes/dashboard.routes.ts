import { Router } from 'express';
import { DashboardController } from '../controllers/DashboardController';
import { pgPool } from '../../../../shared/database/postgres';
import { authMiddleware } from '../../../../shared/middleware/auth.middleware';
import { requireRole } from '../../../../shared/middleware/rbac.middleware';
import { PostgresDashboardRepository } from '../adapters/PostgresDashboardRepository';

const router = Router();
const repository = new PostgresDashboardRepository(pgPool);
const controller = new DashboardController(repository);

router.use(authMiddleware);
router.get('/metrics', requireRole('GERENTE'), (req, res) => controller.getMetrics(req, res));
router.get('/expiring', requireRole('GERENTE'), (req, res) => controller.getExpiring(req, res));
router.get('/trend', requireRole('GERENTE'), (req, res) => controller.getTrend(req, res));
router.get('/losses', requireRole('GERENTE'), (req, res) => controller.getLosses(req, res));
router.post('/run-expiration-job', requireRole('GERENTE'), (req, res) => controller.runExpirationJob(req, res));

export default router;
