import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { RolesGuard } from './auth/guards/roles.guard';
//import * as fs from 'fs';

async function bootstrap() {
  /*
  const httpsOptions = {
    key: fs.readFileSync('./secrets/cert.key', 'utf8'),
    cert: fs.readFileSync('./secrets/cert.crt', 'utf8'),
  };
  */
  const config = new DocumentBuilder()
    .addBearerAuth()
    .setTitle('ConvertaX API')
    .setDescription('Backend Challenge API')
    .setVersion('1.0')
    .addTag('by DiegoLucas')
    .build();

  const app = await NestFactory.create(AppModule /*{ httpsOptions }*/);

  app.enableCors();
  app.setGlobalPrefix('/convertax/api/v1');
  app.useGlobalPipes(new ValidationPipe());

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/convertax/api/v1/docs', app, document);

  const reflector = app.get(Reflector);
  app.useGlobalGuards(new RolesGuard(reflector));
  await app.listen(3000);
}

bootstrap();
