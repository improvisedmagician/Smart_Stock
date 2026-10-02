import { Router } from 'express';
import { PurchaseOrderController } from '../controllers/PurchaseOrderController';
import { CreatePurchaseOrderUseCase } from '../../application/usecases/orders/CreatePurchaseOrderUseCase';
import { ListPurchaseOrdersUseCase } from '../../application/usecases/orders/ListPurchaseOrdersUseCase';
import { UpdatePurchaseOrderStatusUseCase } from '../../application/usecases/orders/UpdatePurchaseOrderStatusUseCase';
import { PostgresPurchaseOrderRepository } from '../adapters/PostgresPurchaseOrderRepository';
import { pgPool } from '../../../../shared/database/postgres';
import { authMiddleware } from '../../../../shared/middleware/auth.middleware';
import { requireRole } from '../../../../shared/middleware/rbac.middleware';

const router = Router();
const repo = new PostgresPurchaseOrderRepository(pgPool);
const controller = new PurchaseOrderController(
  new CreatePurchaseOrderUseCase(repo),
  new ListPurchaseOrdersUseCase(repo),
  new UpdatePurchaseOrderStatusUseCase(repo)
);

router.use(authMiddleware);

router.get('/', (req, res, next) => controller.list(req, res, next));
router.post('/', requireRole('GERENTE'), (req, res, next) => controller.create(req, res, next));
router.patch('/:id/status', requireRole('GERENTE'), (req, res, next) => controller.updateStatus(req, res, next));

export default router;
