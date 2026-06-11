import { ValidationPipe, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

import { AppModule } from './app.module';

async function bootstrap() {
  const app =
    await NestFactory.create<NestExpressApplication>(AppModule);

  const logger = new Logger('LaRuedaMarket');

  /* =========================
     ARCHIVOS ESTÁTICOS
  ========================== */
  app.useStaticAssets(join(__dirname, '..', 'upload'), {
    prefix: '/upload/',
  });

  app.useStaticAssets(join(__dirname, '..', 'upload'), {
  prefix: '/uploads/',
});

  /* =========================
     CORS
  ========================== */
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:3001',
    ],
    credentials: true,
  });

  /* =========================
     DESACTIVAR CACHE EN DESARROLLO
  ========================== */
  app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
  });

  /* =========================
     PREFIJO GLOBAL
  ========================== */
  app.setGlobalPrefix('api');

  /* =========================
     VALIDACIONES GLOBALES
  ========================== */
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  /* =========================
     SWAGGER
  ========================== */
  const config = new DocumentBuilder()
    .setTitle('La Rueda Market API')
    .setDescription(
      'API para gestión de clientes, administradores, productos, pedidos y domicilios.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api/docs', app, document);

  /* =========================
     PUERTO
  ========================== */
  const port = Number(process.env.PORT) || 3000;

  await app.listen(port);

  logger.log(`Servidor corriendo en http://localhost:${port}/api`);
  logger.log(`Swagger disponible en http://localhost:${port}/api/docs`);
  logger.log(`Archivos estáticos en http://localhost:${port}/upload/`);
  logger.log(`Archivos estáticos también en http://localhost:${port}/uploads/`);
}

bootstrap();