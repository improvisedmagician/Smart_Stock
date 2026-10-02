import { Router } from 'express';
import { BatchController } from '../controllers/BatchController';
import { RegisterBatchUseCase } from '../../application/usecases/batches/RegisterBatchUseCase';
import { ExpeditionUseCase } from '../../application/usecases/batches/ExpeditionUseCase';
import { ListBatchesUseCase } from '../../application/usecases/batches/ListBatchesUseCase';
import { PostgresBatchRepository } from '../adapters/PostgresBatchRepository';
import { PostgresProductRepository } from '../adapters/PostgresProductRepository';
import { pgPool } from '../../../../shared/database/postgres';
import { authMiddleware } from '../../../../shared/middleware/auth.middleware';

const router = Router();
const batchRepo = new PostgresBatchRepository(pgPool);
const productRepo = new PostgresProductRepository(pgPool);
const controller = new BatchController(
  new RegisterBatchUseCase(batchRepo),
  new ExpeditionUseCase(batchRepo, productRepo),
  new ListBatchesUseCase(batchRepo)
);

router.use(authMiddleware);
router.get('/', (req, res, next) => controller.list(req, res, next));
router.post('/register', (req, res, next) => controller.register(req, res, next));
router.post('/expedition', (req, res, next) => controller.expedition(req, res, next));

export default router;
