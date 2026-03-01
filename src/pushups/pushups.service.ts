import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PushupsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, count: number, date?: Date) {
    const entryDate = date || new Date();
    // Normalize to start of day
    entryDate.setHours(0, 0, 0, 0);

    return this.prisma.pushupEntry.create({
      data: {
        userId,
        count,
        date: entryDate,
      },
    });
  }

  async findAll(userId: number, take = 30, skip = 0) {
    const [entries, total] = await Promise.all([
      this.prisma.pushupEntry.findMany({
        where: { userId },
        orderBy: { date: 'desc' },
        take,
        skip,
      }),
      this.prisma.pushupEntry.count({ where: { userId } }),
    ]);

    return {
      entries,
      total,
      hasMore: skip + take < total,
    };
  }

  async findToday(userId: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const entries = await this.prisma.pushupEntry.findMany({
      where: {
        userId,
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    const totalCount = entries.reduce((sum, entry) => sum + entry.count, 0);

    return {
      entries,
      totalCount,
      date: today,
    };
  }

  async update(id: number, userId: number, count: number) {
    const entry = await this.prisma.pushupEntry.findUnique({
      where: { id },
    });

    if (!entry) {
      throw new NotFoundException('Entry not found');
    }

    if (entry.userId !== userId) {
      throw new ForbiddenException('Not authorized to update this entry');
    }

    return this.prisma.pushupEntry.update({
      where: { id },
      data: { count },
    });
  }

  async delete(id: number, userId: number) {
    const entry = await this.prisma.pushupEntry.findUnique({
      where: { id },
    });

    if (!entry) {
      throw new NotFoundException('Entry not found');
    }

    if (entry.userId !== userId) {
      throw new ForbiddenException('Not authorized to delete this entry');
    }

    return this.prisma.pushupEntry.delete({
      where: { id },
    });
  }
}
