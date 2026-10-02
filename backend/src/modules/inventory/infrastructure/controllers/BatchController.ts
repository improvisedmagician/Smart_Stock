import { Request, Response, NextFunction } from 'express';
import { RegisterBatchUseCase } from '../../application/usecases/batches/RegisterBatchUseCase';
import { ExpeditionUseCase } from '../../application/usecases/batches/ExpeditionUseCase';
import { ListBatchesUseCase } from '../../application/usecases/batches/ListBatchesUseCase';
import { AuthRequest } from '../../../../shared/middleware/auth.middleware';

export class BatchController {
  constructor(
    private registerUseCase: RegisterBatchUseCase,
    private expUseCase: ExpeditionUseCase,
    private listUseCase: ListBatchesUseCase
  ) {}

  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const productId = req.query.productId as string;
      const result = await this.listUseCase.execute(productId);
      res.json({ data: result, total: result.length });
    } catch (e) { next(e); }
  }

  async register(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await this.registerUseCase.execute(req.body, req.user!.userId, req.user!.name);
      res.status(201).json(result);
    } catch (e) { next(e); }
  }

  async expedition(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { productId, quantity } = req.body;
      const result = await this.expUseCase.execute(productId, quantity, req.user!.userId, req.user!.name);
      res.json(result);
    } catch (e) { next(e); }
  }
}
