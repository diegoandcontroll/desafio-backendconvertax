import { Module } from '@nestjs/common';

import { AppService } from './app.service';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';

import { WithdrawalsModule } from './withdrawals/withdrawals.module';
import { InvestmentsModule } from './investments/investments.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { CacheModule } from '@nestjs/cache-manager';
import { AppController } from './app/app.controller';

@Module({
  imports: [
    ConfigModule.forRoot(),
    CacheModule.register({
      store: 'redis',
      host: 'localhost', // Ajuste se necessário
      port: 6379,
    }),
    UsersModule,
    AuthModule,
    PrismaModule,
    WithdrawalsModule,
    InvestmentsModule,
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 3,
      },
      {
        name: 'long',
        ttl: 600000,
        limit: 100,
      },
    ]),
    ClientsModule.register([
      {
        name: 'INVESTMENTS_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [
            `${process.env.RABBITMQ_URI}` ||
              'amqp://guest:guest@localhost:5672',
          ],
          queue: 'investments_queue',
          queueOptions: {
            durable: true,
          },
        },
      },
      {
        name: 'WITHDRAWALS_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [
            `${process.env.RABBITMQ_URI}` ||
              'amqp://guest:guest@localhost:5672',
          ],
          queue: 'withdrawals_queue',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    PrismaModule,
  ],
})
export class AppModule {}
