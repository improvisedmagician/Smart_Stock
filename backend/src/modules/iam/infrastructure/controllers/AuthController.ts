import { Request, Response, NextFunction } from 'express';
import { LoginUseCase } from '../../application/usecases/LoginUseCase';
import { RegisterUseCase } from '../../application/usecases/RegisterUseCase';
import { GetProfileUseCase } from '../../application/usecases/GetProfileUseCase';
import { ListUsersUseCase } from '../../application/usecases/ListUsersUseCase';
import { AuthRequest } from '../../../../shared/middleware/auth.middleware';

export class AuthController {
  constructor(
    private loginUseCase: LoginUseCase,
    private registerUseCase: RegisterUseCase,
    private getProfileUseCase: GetProfileUseCase,
    private listUsersUseCase: ListUsersUseCase
  ) {}

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await this.loginUseCase.execute(email, password);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.registerUseCase.execute(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async profile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const result = await this.getProfileUseCase.execute(userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.listUsersUseCase.execute();
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}
