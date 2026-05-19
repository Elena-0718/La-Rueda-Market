import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateUserDto } from './DTOS/UpdateUser.dto';
import { User } from '../entities/users.entity';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getAllUsersRepository(): Promise<User[]> {
    return this.userRepository.find({
      order: { fullName: 'ASC' },
      relations: ['credential'],
    });
  }

  async getUserByIdRepository(uuid: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { uuid },
      relations: ['credential'],
    });
  }

  async getUserByPhoneRepository(phone: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { phone },
      relations: ['credential'],
    });
  }

  async createUserRepository(newUser: Partial<User>): Promise<User> {
    const user = this.userRepository.create(newUser);
    return this.userRepository.save(user);
  }

  async updateUserRepository(
  user: User,
  updateUserDto: Partial<User>,
): Promise<User> {
  Object.assign(user, updateUserDto);

  return this.userRepository.save(user);
}

  async softDeleteUserRepository(user: User): Promise<{ message: string }> {
    user.isActive = false;
    await this.userRepository.save(user);

    return {
      message: 'Usuario desactivado correctamente.',
    };
  }
}