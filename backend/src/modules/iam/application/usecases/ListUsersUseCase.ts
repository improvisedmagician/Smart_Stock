import { UserRepositoryPort } from '../../domain/ports/UserRepository.port';

export class ListUsersUseCase {
  constructor(private userRepository: UserRepositoryPort) {}

  async execute() {
    return this.userRepository.findAll();
  }
}
