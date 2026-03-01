import { Controller, Get, UseGuards, Request, Param, ParseIntPipe } from '@nestjs/common';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/stats')
@UseGuards(JwtAuthGuard)
export class StatsController {
  constructor(private statsService: StatsService) {}

  @Get('personal')
  async getPersonal(@Request() req) {
    return {
      daily: await this.statsService.getPersonalStats(req.user.id),
      weekly: await this.statsService.getWeeklyStats(req.user.id),
    };
  }

  @Get('group/:id')
  async getGroup(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return await this.statsService.getGroupStats(id);
  }
}
