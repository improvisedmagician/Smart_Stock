import { Request, Response, NextFunction } from 'express';
import { CreateProductUseCase } from '../../application/usecases/products/CreateProductUseCase';
import { ListProductsUseCase } from '../../application/usecases/products/ListProductsUseCase';
import { GetProductUseCase } from '../../application/usecases/products/GetProductUseCase';
import { UpdateProductUseCase } from '../../application/usecases/products/UpdateProductUseCase';
import { DeleteProductUseCase } from '../../application/usecases/products/DeleteProductUseCase';

export class ProductController {
  constructor(
    private createUseCase: CreateProductUseCase,
    private listUseCase: ListProductsUseCase,
    private getUseCase: GetProductUseCase,
    private updateUseCase: UpdateProductUseCase,
    private deleteUseCase: DeleteProductUseCase
  ) {}

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await this.createUseCase.execute(req.body);
      res.status(201).json(product);
    } catch (e) { next(e); }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = req.query.search as string;
      const result = await this.listUseCase.execute(page, limit, search);
      res.json(result);
    } catch (e) { next(e); }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await this.getUseCase.execute(req.params.id);
      res.json(product);
    } catch (e) { next(e); }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await this.updateUseCase.execute(req.params.id, req.body);
      res.json(product);
    } catch (e) { next(e); }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await this.deleteUseCase.execute(req.params.id);
      res.status(204).send();
    } catch (e) { next(e); }
  }
}
