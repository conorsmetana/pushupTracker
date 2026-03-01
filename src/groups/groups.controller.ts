import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/groups')
@UseGuards(JwtAuthGuard)
export class GroupsController {
  constructor(private groupsService: GroupsService) {}

  @Post()
  async create(@Request() req, @Body('name') name: string) {
    return this.groupsService.create(req.user.id, name);
  }

  @Get()
  async findAll(@Request() req) {
    return this.groupsService.findUserGroups(req.user.id);
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.groupsService.findOne(id, req.user.id);
  }

  @Post('join')
  async join(@Request() req, @Body('inviteCode') inviteCode: string) {
    return this.groupsService.join(req.user.id, inviteCode);
  }

  @Get(':id/members')
  async getMembers(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.groupsService.getMembers(id, req.user.id);
  }

  @Get(':id/leaderboard')
  async getLeaderboard(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Query('period') period?: 'today' | 'week' | 'month',
  ) {
    return this.groupsService.getLeaderboard(id, req.user.id, period || 'week');
  }

  @Delete(':id/members/:memberId')
  async removeMember(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Param('memberId', ParseIntPipe) memberId: number,
  ) {
    return this.groupsService.leave(id, req.user.id, memberId);
  }

  @Delete(':id/leave')
  async leave(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.groupsService.leave(id, req.user.id);
  }
}
