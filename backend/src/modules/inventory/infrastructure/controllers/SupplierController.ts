import { Request, Response, NextFunction } from 'express';
import { CreateSupplierUseCase } from '../../application/usecases/suppliers/CreateSupplierUseCase';
import { ListSuppliersUseCase } from '../../application/usecases/suppliers/ListSuppliersUseCase';
import { GetSupplierUseCase, UpdateSupplierUseCase } from '../../application/usecases/suppliers/SupplierUseCases';
import { DeleteSupplierUseCase } from '../../application/usecases/suppliers/DeleteSupplierUseCase';

export class SupplierController {
  constructor(
    private createUseCase: CreateSupplierUseCase,
    private listUseCase: ListSuppliersUseCase,
    private getUseCase: GetSupplierUseCase,
    private updateUseCase: UpdateSupplierUseCase,
    private deleteUseCase: DeleteSupplierUseCase
  ) {}

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const supplier = await this.createUseCase.execute(req.body);
      res.status(201).json(supplier);
    } catch (e) { next(e); }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await this.listUseCase.execute(page, limit);
      res.json(result);
    } catch (e) { next(e); }
  }

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const supplier = await this.getUseCase.execute(req.params.id);
      res.json(supplier);
    } catch (e) { next(e); }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const supplier = await this.updateUseCase.execute(req.params.id, req.body);
      res.json(supplier);
    } catch (e) { next(e); }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await this.deleteUseCase.execute(req.params.id);
      res.status(204).send();
    } catch (e) { next(e); }
  }
}
