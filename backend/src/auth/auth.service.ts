import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { CredentialRepository } from '../credential/credential.repository';
import { UserRepository } from '../users/users.repository';
import { SignUpDto } from '../credential/DTOS/sign-up.dto';
import { LoginDto } from '../credential/DTOS/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly credentialRepository: CredentialRepository,
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async signUpService(signUpDto: SignUpDto) {
    const { createCredentialDto, createUserDto } = signUpDto;

    const credentialExists =
      await this.credentialRepository.getCredentialByPhoneRepository(
        createCredentialDto.phone,
      );

    if (credentialExists) {
      throw new ConflictException(
        'Este número de celular ya se encuentra registrado.',
      );
    }

    const userByPhone =
      await this.userRepository.getUserByPhoneRepository(
        createUserDto.phone,
      );

    if (userByPhone) {
      throw new ConflictException(
        'Ya existe un usuario con este número de celular.',
      );
    }

    const hashedPassword = await bcrypt.hash(
      createCredentialDto.password,
      10,
    );

    const newCredential =
      await this.credentialRepository.postCreateCredentialRepository({
        phone: createCredentialDto.phone,
        password: hashedPassword,
      });

    const newUser =
      await this.userRepository.createUserRepository({
        fullName: createUserDto.fullName,
        phone: createUserDto.phone,
        village: createUserDto.village,
        birthDate: createUserDto.birthDate
          ? new Date(createUserDto.birthDate)
          : null,
        photoUrl: createUserDto.photoUrl ?? null,
        credential: newCredential,
      });

    const { password, refreshToken, resetCode, resetCodeExpiresAt, ...credentialSafe } =
      newCredential as any;

    const { credential, ...userSafe } = newUser as any;

    return {
      message: 'Usuario registrado exitosamente.',
      credential: credentialSafe,
      profile: userSafe,
    };
  }

  async signInService(loginDto: LoginDto) {
    const { phone, password } = loginDto;

    const credential =
      await this.credentialRepository.getCredentialByPhoneRepository(phone);

    if (!credential || !credential.isActive) {
      throw new UnauthorizedException(
        'Credenciales incorrectas o cuenta inactiva.',
      );
    }

    if (!credential.user || !credential.user.isActive) {
      throw new UnauthorizedException(
        'El perfil del usuario se encuentra inactivo.',
      );
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      credential.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales incorrectas.');
    }

    const payload = {
      sub: credential.user.uuid,
      credential_uuid: credential.uuid,
      phone: credential.phone,
      role: credential.role,
    };

    return {
      message: 'Inicio de sesión exitoso.',
      token: this.jwtService.sign(payload),
      user: {
        id: credential.user.uuid,
        credentialId: credential.uuid,
        name: credential.user.fullName,
        phone: credential.user.phone,
        loginPhone: credential.phone,
        village: credential.user.village,
        photoUrl: credential.user.photoUrl,
        role: credential.role,
      },
    };
  }
}