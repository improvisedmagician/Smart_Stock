import { Request, Response, NextFunction } from 'express';
import { CreatePurchaseOrderUseCase } from '../../application/usecases/orders/CreatePurchaseOrderUseCase';
import { ListPurchaseOrdersUseCase } from '../../application/usecases/orders/ListPurchaseOrdersUseCase';
import { UpdatePurchaseOrderStatusUseCase } from '../../application/usecases/orders/UpdatePurchaseOrderStatusUseCase';

export class PurchaseOrderController {
  constructor(
    private createUseCase: CreatePurchaseOrderUseCase,
    private listUseCase: ListPurchaseOrdersUseCase,
    private updateStatusUseCase: UpdatePurchaseOrderStatusUseCase
  ) {}

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      // In a real scenario we'd get triggeredBy from req.user
      const order = await this.createUseCase.execute({ ...req.body });
      res.status(201).json(order);
    } catch (e) { next(e); }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const status = req.query.status as string;
      const result = await this.listUseCase.execute(page, status);
      res.json(result);
    } catch (e) { next(e); }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await this.updateStatusUseCase.execute(req.params.id, req.body.status);
      res.json(order);
    } catch (e) { next(e); }
  }
}
