import { UserRepositoryPort } from '../../domain/ports/UserRepository.port';
import { AppError } from '../../../../shared/errors/AppError';

export class GetProfileUseCase {
  constructor(private userRepository: UserRepositoryPort) {}

  async execute(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
