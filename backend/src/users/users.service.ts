import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { User } from '../entities/users.entity';
import { UserRepository } from './users.repository';
import { CreateUserDto } from './dtos/CreateUser.dto';
import { UpdateUserDto } from './dtos/UpdateUser.dto';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async createUserService(createUserDto: CreateUserDto): Promise<User> {
    const userByPhone =
      await this.userRepository.getUserByPhoneRepository(
        createUserDto.phone,
      );

    if (userByPhone) {
      throw new ConflictException(
        'Ya existe un usuario con este teléfono.',
      );
    }

    const newUser: Partial<User> = {
      fullName: createUserDto.fullName,
      phone: createUserDto.phone,
      village: createUserDto.village,
      birthDate: createUserDto.birthDate
        ? new Date(createUserDto.birthDate)
        : null,
      photoUrl: createUserDto.photoUrl ?? null,
    };

    return this.userRepository.createUserRepository(newUser);
  }

  async getAllUsersService(): Promise<User[]> {
    return this.userRepository.getAllUsersRepository();
  }

  async getUserByIdService(userUuid: string): Promise<User> {
    const user =
      await this.userRepository.getUserByIdRepository(userUuid);

    if (!user) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    return user;
  }

  async getUserProfileService(req: {
    user: { userId: string };
  }): Promise<User> {
    const userUuid = req.user.userId;

    const user =
      await this.userRepository.getUserByIdRepository(userUuid);

    if (!user) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    if (!user.isActive) {
      throw new ConflictException(
        'Este perfil se encuentra desactivado.',
      );
    }

    return user;
  }

  async updateUserProfileService(
    req: { user: { userId: string } },
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    const userUuid = req.user.userId;

    const user = await this.getUserByIdService(userUuid);

    if (!user.isActive) {
      throw new ConflictException(
        'Este usuario se encuentra desactivado.',
      );
    }

    const userByPhone =
      updateUserDto.phone &&
      updateUserDto.phone !== user.phone
        ? await this.userRepository.getUserByPhoneRepository(
            updateUserDto.phone,
          )
        : null;

    if (userByPhone) {
      throw new ConflictException(
        'Ya existe un usuario con este teléfono.',
      );
    }

    const updatedUser: Partial<User> = {
      ...updateUserDto,
      birthDate: updateUserDto.birthDate
        ? new Date(updateUserDto.birthDate)
        : user.birthDate,
    };

    return this.userRepository.updateUserRepository(
      user,
      updatedUser,
    );
  }

  async updateUserByAdminService(
    userUuid: string,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    const user = await this.getUserByIdService(userUuid);

    const userByPhone =
      updateUserDto.phone &&
      updateUserDto.phone !== user.phone
        ? await this.userRepository.getUserByPhoneRepository(
            updateUserDto.phone,
          )
        : null;

    if (userByPhone) {
      throw new ConflictException(
        'Ya existe un usuario con este teléfono.',
      );
    }

    const updatedUser: Partial<User> = {
      ...updateUserDto,
      birthDate: updateUserDto.birthDate
        ? new Date(updateUserDto.birthDate)
        : user.birthDate,
    };

    return this.userRepository.updateUserRepository(
      user,
      updatedUser,
    );
  }

  async deactivateUserService(
    userUuid: string,
  ): Promise<{ message: string }> {
    const user = await this.getUserByIdService(userUuid);

    if (!user.isActive) {
      throw new ConflictException(
        'Este usuario ya se encuentra desactivado.',
      );
    }

    return this.userRepository.softDeleteUserRepository(user);
  }
}