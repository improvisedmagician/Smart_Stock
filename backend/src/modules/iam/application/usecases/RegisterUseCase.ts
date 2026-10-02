import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { UserRepositoryPort } from '../../domain/ports/UserRepository.port';
import { AppError } from '../../../../shared/errors/AppError';
import { User } from '../../domain/entities/User';

export class RegisterUseCase {
  constructor(private userRepository: UserRepositoryPort) {}

  async execute(data: Omit<User, 'id' | 'passwordHash' | 'active' | 'createdAt' | 'updatedAt'> & { password: string }) {
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new AppError('Email já está em uso', 400);
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    
    const newUser: User = {
      id: uuidv4(),
      name: data.name,
      email: data.email,
      passwordHash,
      role: data.role || 'OPERADOR',
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const savedUser = await this.userRepository.save(newUser);
    const { passwordHash: _, ...userWithoutPassword } = savedUser;
    
    return userWithoutPassword;
  }
}
