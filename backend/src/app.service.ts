import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from './entities/users.entity';
import { Credential } from './entities/credential.entity';
import { Roles } from './enum/roles.enum';

@Injectable()
export class AppService {
  getHello(): string {
    return 'La Rueda Market API 🚀';
  }
}

@Injectable()
export class DataLoaderUsers implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Credential)
    private readonly credentialRepo: Repository<Credential>,
  ) {}

  async onModuleInit() {
    const adminPhone = '3186844954';

    const adminExists = await this.credentialRepo.findOne({
      where: { phone: adminPhone },
    });

    if (adminExists) {
      console.log('👤 Admin inicial ya existe.');
      return;
    }

    const hashedPassword = await bcrypt.hash('Admin123*', 10);

    const credential = this.credentialRepo.create({
      phone: adminPhone,
      password: hashedPassword,
      role: Roles.ADMIN,
      isActive: true,
    });

    await this.credentialRepo.save(credential);

    const user = this.userRepo.create({
      fullName: 'Administrador La Rueda Market',
      phone: adminPhone,
      village: 'El Espinal',
      birthDate: null,
      photoUrl: null,
      isActive: true,
      credential,
    });

    await this.userRepo.save(user);

    console.log('✅ Admin inicial creado correctamente.');
  }
}