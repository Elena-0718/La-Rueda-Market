import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtSignOptions } from '@nestjs/jwt';
import {
  TypeOrmModule,
  TypeOrmModuleOptions,
} from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import typeorm from './config/typeorm';

@Module({
  imports: [
    /* =========================
       CONFIG GLOBAL
    ========================== */

    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.development',
      load: [typeorm],
    }),

    /* =========================
       TYPEORM
    ========================== */

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],

      useFactory: (
        config: ConfigService,
      ): TypeOrmModuleOptions =>
        config.getOrThrow<TypeOrmModuleOptions>(
          'typeorm',
        ),
    }),

    /* =========================
       JWT
    ========================== */

    JwtModule.registerAsync({
      imports: [ConfigModule],

      inject: [ConfigService],

      global: true,

      useFactory: (
        config: ConfigService,
      ) => {
        const expiresIn =
          config.get<
            JwtSignOptions['expiresIn']
          >('JWT_EXPIRES_IN') || '1d';

        return {
          secret:
            config.getOrThrow<string>(
              'JWT_SECRET',
            ),

          signOptions: {
            expiresIn,
          },
        };
      },
    }),
  ],

  controllers: [AppController],

  providers: [AppService],
})
export class AppModule {}