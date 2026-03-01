import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  async getPersonalStats(userId: number) {
    // Daily totals for last 30 days
    const since = new Date();
    since.setDate(since.getDate() - 29);
    since.setHours(0, 0, 0, 0);

    const entries = await this.prisma.pushupEntry.findMany({
      where: { userId, date: { gte: since } },
      orderBy: { date: 'asc' },
    });

    // Group by day
    const stats: Record<string, number> = {};
    for (let i = 0; i < 30; i++) {
      const d = new Date(since);
      d.setDate(since.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      stats[key] = 0;
    }
    for (const entry of entries) {
      const key = entry.date.toISOString().slice(0, 10);
      stats[key] = (stats[key] || 0) + entry.count;
    }
    return stats;
  }

  async getWeeklyStats(userId: number) {
    // Weekly totals for last 12 weeks
    const now = new Date();
    const stats: Record<string, number> = {};
    for (let i = 0; i < 12; i++) {
      const start = new Date(now);
      start.setDate(now.getDate() - now.getDay() - i * 7);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(start.getDate() + 7);
      const key = start.toISOString().slice(0, 10);
      const total = await this.prisma.pushupEntry.aggregate({
        _sum: { count: true },
        where: {
          userId,
          date: { gte: start, lt: end },
        },
      });
      stats[key] = total._sum.count || 0;
    }
    return stats;
  }

  async getGroupStats(groupId: number) {
    // Aggregate group member stats for last 30 days and last 12 weeks
    const since = new Date();
    since.setDate(since.getDate() - 29);
    since.setHours(0, 0, 0, 0);
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() - 11 * 7);
    weekStart.setHours(0, 0, 0, 0);
    const members = await this.prisma.groupMember.findMany({
      where: { groupId },
      include: {
        user: {
          select: { id: true, name: true, pushupEntries: true },
        },
      },
    });
    const stats = members.map((m) => ({
      userId: m.user.id,
      name: m.user.name,
      daily: Array.from({ length: 30 }, (_, i) => {
        const d = new Date(since);
        d.setDate(since.getDate() + i);
        const key = d.toISOString().slice(0, 10);
        return {
          date: key,
          count: m.user.pushupEntries.filter((e) => e.date.toISOString().slice(0, 10) === key).reduce((sum, e) => sum + e.count, 0),
        };
      }),
      weekly: Array.from({ length: 12 }, (_, i) => {
        const start = new Date(weekStart);
        start.setDate(weekStart.getDate() + i * 7);
        const end = new Date(start);
        end.setDate(start.getDate() + 7);
        const key = start.toISOString().slice(0, 10);
        const count = m.user.pushupEntries.filter((e) => {
          const dt = e.date;
          return dt >= start && dt < end;
        }).reduce((sum, e) => sum + e.count, 0);
        return { week: key, count };
      }),
    }));
    return stats;
  }
}
