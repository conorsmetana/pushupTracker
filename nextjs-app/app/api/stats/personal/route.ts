import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth.error) {
    return NextResponse.json(
      { error: auth.message },
      { status: auth.status }
    );
  }

  try {
    const userId = parseInt(auth.user!.id);

    // Daily totals for last 30 days
    const since = new Date();
    since.setDate(since.getDate() - 29);
    since.setHours(0, 0, 0, 0);

    const entries = await prisma.pushupEntry.findMany({
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

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching personal stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch personal stats' },
      { status: 500 }
    );
  }
}
