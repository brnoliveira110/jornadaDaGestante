import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExamsController } from './exams.controller';
import { ExamsService } from './exams.service';
import { Exam } from './exam.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Exam])],
  controllers: [ExamsController],
  providers: [ExamsService]
})
export class ExamsModule { }
