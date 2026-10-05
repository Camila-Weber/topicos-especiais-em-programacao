import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import { TranscriptionsModule } from './transcriptions/transcriptions.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DATABASE_HOST', 'localhost'),
        port: config.get<number>('DATABASE_PORT', 5432),
        username: config.get<string>('DATABASE_USER', 'ditado'),
        password: config.get<string>('DATABASE_PASSWORD', 'ditado'),
        database: config.get<string>('DATABASE_NAME', 'ditado'),
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    AuthModule,
    HealthModule,
    TranscriptionsModule,
    UsersModule,
  ],
})
export class AppModule {}
