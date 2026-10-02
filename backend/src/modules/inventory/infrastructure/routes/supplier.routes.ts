import { Router } from 'express';
import { SupplierController } from '../controllers/SupplierController';
import { CreateSupplierUseCase } from '../../application/usecases/suppliers/CreateSupplierUseCase';
import { ListSuppliersUseCase } from '../../application/usecases/suppliers/ListSuppliersUseCase';
import { GetSupplierUseCase, UpdateSupplierUseCase } from '../../application/usecases/suppliers/SupplierUseCases';
import { DeleteSupplierUseCase } from '../../application/usecases/suppliers/DeleteSupplierUseCase';
import { PostgresSupplierRepository } from '../adapters/PostgresSupplierRepository';
import { pgPool } from '../../../../shared/database/postgres';
import { authMiddleware } from '../../../../shared/middleware/auth.middleware';
import { requireRole } from '../../../../shared/middleware/rbac.middleware';

const router = Router();
const repo = new PostgresSupplierRepository(pgPool);
const controller = new SupplierController(
  new CreateSupplierUseCase(repo),
  new ListSuppliersUseCase(repo),
  new GetSupplierUseCase(repo),
  new UpdateSupplierUseCase(repo),
  new DeleteSupplierUseCase(repo)
);

router.use(authMiddleware);

router.get('/', (req, res, next) => controller.list(req, res, next));
router.get('/:id', (req, res, next) => controller.get(req, res, next));
router.post('/', requireRole('GERENTE'), (req, res, next) => controller.create(req, res, next));
router.put('/:id', requireRole('GERENTE'), (req, res, next) => controller.update(req, res, next));
router.delete('/:id', requireRole('GERENTE'), (req, res, next) => controller.delete(req, res, next));

export default router;
