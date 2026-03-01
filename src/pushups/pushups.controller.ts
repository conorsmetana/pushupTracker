import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { PushupsService } from './pushups.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

class CreatePushupDto {
  count: number;
  date?: string;
}

class UpdatePushupDto {
  count: number;
}

@Controller('api/pushups')
@UseGuards(JwtAuthGuard)
export class PushupsController {
  constructor(private pushupsService: PushupsService) {}

  @Post()
  async create(@Request() req, @Body() body: CreatePushupDto) {
    const date = body.date ? new Date(body.date) : undefined;
    return this.pushupsService.create(req.user.id, body.count, date);
  }

  @Get()
  async findAll(
    @Request() req,
    @Query('take') take?: string,
    @Query('skip') skip?: string,
  ) {
    return this.pushupsService.findAll(
      req.user.id,
      take ? parseInt(take, 10) : 30,
      skip ? parseInt(skip, 10) : 0,
    );
  }

  @Get('today')
  async findToday(@Request() req) {
    return this.pushupsService.findToday(req.user.id);
  }

  @Put(':id')
  async update(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdatePushupDto,
  ) {
    return this.pushupsService.update(id, req.user.id, body.count);
  }

  @Delete(':id')
  async delete(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.pushupsService.delete(id, req.user.id);
  }
}
