import { User } from '../entities/User';

export interface UserRepositoryPort {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  findAll(): Promise<Omit<User, 'passwordHash'>[]>;
  save(user: User): Promise<User>;
}
