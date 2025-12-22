import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConsultationsController } from './consultations.controller';
import { ConsultationsService } from './consultations.service';
import { Consultation } from './consultation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Consultation])],
  controllers: [ConsultationsController],
  providers: [ConsultationsService]
})
export class ConsultationsModule { }
