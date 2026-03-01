import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { randomBytes } from 'crypto';

@Injectable()
export class GroupsService {
  constructor(private prisma: PrismaService) {}

  private generateInviteCode(): string {
    return randomBytes(4).toString('hex').toUpperCase();
  }

  async create(userId: number, name: string) {
    const inviteCode = this.generateInviteCode();
    
    const group = await this.prisma.group.create({
      data: {
        name,
        inviteCode,
        members: {
          create: {
            userId,
            role: 'owner',
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    return group;
  }

  async findUserGroups(userId: number) {
    return this.prisma.group.findMany({
      where: {
        members: {
          some: { userId },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        _count: {
          select: { members: true },
        },
      },
    });
  }

  async findOne(id: number, userId: number) {
    const group = await this.prisma.group.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    // Check if user is a member
    const isMember = group.members.some((m) => m.userId === userId);
    if (!isMember) {
      throw new ForbiddenException('You are not a member of this group');
    }

    return group;
  }

  async join(userId: number, inviteCode: string) {
    const group = await this.prisma.group.findUnique({
      where: { inviteCode: inviteCode.toUpperCase() },
    });

    if (!group) {
      throw new NotFoundException('Invalid invite code');
    }

    // Check if already a member
    const existingMember = await this.prisma.groupMember.findUnique({
      where: {
        userId_groupId: {
          userId,
          groupId: group.id,
        },
      },
    });

    if (existingMember) {
      throw new BadRequestException('You are already a member of this group');
    }

    await this.prisma.groupMember.create({
      data: {
        userId,
        groupId: group.id,
        role: 'member',
      },
    });

    return this.findOne(group.id, userId);
  }

  async getMembers(groupId: number, userId: number) {
    // Verify user is a member
    await this.findOne(groupId, userId);

    return this.prisma.groupMember.findMany({
      where: { groupId },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async getLeaderboard(groupId: number, userId: number, period: 'today' | 'week' | 'month' = 'week') {
    // Verify user is a member
    await this.findOne(groupId, userId);

    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        const dayOfWeek = now.getDay();
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }

    const members = await this.prisma.groupMember.findMany({
      where: { groupId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            pushupEntries: {
              where: {
                date: { gte: startDate },
              },
            },
          },
        },
      },
    });

    const leaderboard = members
      .map((member) => ({
        userId: member.user.id,
        name: member.user.name,
        email: member.user.email,
        totalPushups: member.user.pushupEntries.reduce((sum, entry) => sum + entry.count, 0),
        entriesCount: member.user.pushupEntries.length,
      }))
      .sort((a, b) => b.totalPushups - a.totalPushups);

    return {
      period,
      startDate,
      leaderboard,
    };
  }

  async leave(groupId: number, userId: number, memberId?: number) {
    const group = await this.findOne(groupId, userId);
    
    const targetUserId = memberId || userId;
    const currentMember = group.members.find((m) => m.userId === userId);
    const targetMember = group.members.find((m) => m.userId === targetUserId);

    if (!targetMember) {
      throw new NotFoundException('Member not found');
    }

    // Only owners can remove other members
    if (targetUserId !== userId && currentMember?.role !== 'owner') {
      throw new ForbiddenException('Only group owners can remove members');
    }

    // Owner can't leave if they're the only owner
    if (targetMember.role === 'owner') {
      const ownerCount = group.members.filter((m) => m.role === 'owner').length;
      if (ownerCount === 1) {
        throw new BadRequestException('Cannot leave group as the only owner. Transfer ownership or delete the group.');
      }
    }

    await this.prisma.groupMember.delete({
      where: {
        userId_groupId: {
          userId: targetUserId,
          groupId,
        },
      },
    });

    return { message: 'Successfully left the group' };
  }
}
