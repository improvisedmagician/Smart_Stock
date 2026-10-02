import { Router } from 'express';
import { ProductController } from '../controllers/ProductController';
import { CreateProductUseCase } from '../../application/usecases/products/CreateProductUseCase';
import { ListProductsUseCase } from '../../application/usecases/products/ListProductsUseCase';
import { GetProductUseCase } from '../../application/usecases/products/GetProductUseCase';
import { UpdateProductUseCase } from '../../application/usecases/products/UpdateProductUseCase';
import { DeleteProductUseCase } from '../../application/usecases/products/DeleteProductUseCase';
import { PostgresProductRepository } from '../adapters/PostgresProductRepository';
import { pgPool } from '../../../../shared/database/postgres';
import { authMiddleware } from '../../../../shared/middleware/auth.middleware';
import { requireRole } from '../../../../shared/middleware/rbac.middleware';

const router = Router();
const repo = new PostgresProductRepository(pgPool);
const controller = new ProductController(
  new CreateProductUseCase(repo),
  new ListProductsUseCase(repo),
  new GetProductUseCase(repo),
  new UpdateProductUseCase(repo),
  new DeleteProductUseCase(repo)
);

router.use(authMiddleware);
router.get('/', (req, res, next) => controller.list(req, res, next));
router.get('/:id', (req, res, next) => controller.getById(req, res, next));
router.post('/', requireRole('GERENTE'), (req, res, next) => controller.create(req, res, next));
router.put('/:id', requireRole('GERENTE'), (req, res, next) => controller.update(req, res, next));
router.delete('/:id', requireRole('GERENTE'), (req, res, next) => controller.delete(req, res, next));

export default router;
