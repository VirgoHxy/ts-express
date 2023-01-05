import { UserDto } from 'dtos';
import { User } from 'entities';
import { Service } from 'typedi';
import { CustomEntityManager, UserRepository } from '../repositories';

@Service()
export class UserService {
  constructor(@Service() private userRepository: UserRepository) {}

  async deleteAndCreate(id: number, body: UserDto) {
    await this.userRepository.transaction(async (manager: CustomEntityManager<User>) => {
      await manager.insert(User, body);
      await manager.delete(User, id);
    });
  }
}
