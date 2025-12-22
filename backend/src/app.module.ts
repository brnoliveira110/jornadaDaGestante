import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { VaccinesModule } from './vaccines/vaccines.module';
import { AlertsModule } from './alerts/alerts.module';
import { ConsultationsModule } from './consultations/consultations.module';
import { PostsModule } from './posts/posts.module';
import { ExamsModule } from './exams/exams.module';
import { PregnancyDataModule } from './pregnancy-data/pregnancy-data.module';
import { TipsModule } from './tips/tips.module';
import { getDatabaseConfig } from './common/database.util';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: getDatabaseConfig,
    }),
    UsersModule,
    VaccinesModule,
    AlertsModule,
    ConsultationsModule,
    PostsModule,
    ExamsModule,
    PregnancyDataModule,
    TipsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
