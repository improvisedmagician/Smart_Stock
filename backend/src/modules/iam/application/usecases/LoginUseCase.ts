import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserRepositoryPort } from '../../domain/ports/UserRepository.port';
import { AppError } from '../../../../shared/errors/AppError';
import { env } from '../../../../shared/config/env';

export class LoginUseCase {
  constructor(private userRepository: UserRepositoryPort) {}

  async execute(email: string, password: string):Promise<{token: string, user: any}> {
    const user = await this.userRepository.findByEmail(email);
    if (!user || !user.active) {
      throw new AppError('Credenciais inválidas', 401);
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new AppError('Credenciais inválidas', 401);
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role, name: user.name },
      env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    const { passwordHash, ...userWithoutPassword } = user;
    return { token, user: userWithoutPassword };
  }
}
