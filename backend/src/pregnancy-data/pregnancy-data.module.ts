import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PregnancyDataController } from './pregnancy-data.controller';
import { PregnancyDataService } from './pregnancy-data.service';
import { PregnancyData } from './pregnancy-data.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PregnancyData])],
  controllers: [PregnancyDataController],
  providers: [PregnancyDataService]
})
export class PregnancyDataModule { }
