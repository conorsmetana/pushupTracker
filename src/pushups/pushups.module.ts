import { Module } from '@nestjs/common';
import { PushupsService } from './pushups.service';
import { PushupsController } from './pushups.controller';

@Module({
  providers: [PushupsService],
  controllers: [PushupsController],
  exports: [PushupsService],
})
export class PushupsModule {}
