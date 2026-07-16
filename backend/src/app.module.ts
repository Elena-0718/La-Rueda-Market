import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtSignOptions } from '@nestjs/jwt';
import {
  TypeOrmModule,
  TypeOrmModuleOptions,
} from '@nestjs/typeorm';

import { AppController } from './app.controller';
import {
  AppService,
  DataLoaderUsers,
} from './app.service';

import { UsersModule } from './users/users.module';
import { CredentialModule } from './credential/credential.module';
import { AuthModule } from './auth/auth.module';

import { User } from './entities/users.entity';
import { Credential } from './entities/credential.entity';
import { ProductsModule } from './products/products.module';

import { CartModule } from './cart/cart.module';
import { CartDetailModule } from './cart-detail/cart-detail.module';


import typeorm from './config/typeorm';
import { CategoriesModule } from './category/category.module';
import { OrderModule } from './order/order.module';
import { OrderDetailModule } from './order-detail/order-detail.module';
import { PaymentModule } from './payment/payment.module';
import { DeliveryModule } from './delivery/delivery.module';
import { InventoryModule } from './inventory/inventory.module';
import { InventoryMovementModule } from './inventory-movement/inventory-movement.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.development',
      load: [typeorm],
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (
        config: ConfigService,
      ): TypeOrmModuleOptions =>
        config.getOrThrow<TypeOrmModuleOptions>(
          'typeorm',
        ),
    }),

    TypeOrmModule.forFeature([User, Credential]),

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      global: true,
      useFactory: (config: ConfigService) => {
        const expiresIn =
          config.get<JwtSignOptions['expiresIn']>(
            'JWT_EXPIRES_IN',
          ) || '1d';

        return {
          secret: config.getOrThrow<string>(
            'JWT_SECRET',
          ),
          signOptions: {
            expiresIn,
          },
        };
      },
    }),

    UsersModule,
    CredentialModule,
    AuthModule,
    ProductsModule,
    CategoriesModule,
    OrderModule,
    OrderDetailModule,
    CartModule,
    CartDetailModule,
    PaymentModule,
    DeliveryModule,
    InventoryModule,
    InventoryMovementModule,
  ],

  controllers: [AppController],

  providers: [
    AppService,
    DataLoaderUsers,
  ],
})
export class AppModule {}