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
    const { searchParams } = new URL(request.url);
    const { sanitizeTimezone, todayAsUtcMidnight, DAY_MS } = await import('@/lib/timezone');
    const tz = sanitizeTimezone(searchParams.get('timezone'));
    const today = todayAsUtcMidnight(tz);

    // Daily totals for last 30 days
    const since = new Date(today.getTime() - 29 * DAY_MS);

    const entries = await prisma.pushupEntry.findMany({
      where: { userId, date: { gte: since } },
      orderBy: { date: 'asc' },
    });

    // Group by day
    const dailyMap: Record<string, number> = {};
    for (let i = 0; i < 30; i++) {
      const d = new Date(since.getTime() + i * DAY_MS);
      const key = d.toISOString().slice(0, 10);
      dailyMap[key] = 0;
    }

    for (const entry of entries) {
      const key = entry.date.toISOString().slice(0, 10);
      dailyMap[key] = (dailyMap[key] || 0) + entry.count;
    }

    // Convert to array format for charts
    const daily = Object.entries(dailyMap).map(([date, count]) => ({
      date,
      count,
    }));

    // Weekly totals for last 12 weeks
    const dayOfWeek = today.getUTCDay();
    const weeklyStart = new Date(today.getTime() - (dayOfWeek + 11 * 7) * DAY_MS);

    const weeklyEntries = await prisma.pushupEntry.findMany({
      where: { userId, date: { gte: weeklyStart } },
      orderBy: { date: 'asc' },
    });

    // Group by week (Sunday start)
    const weeklyMap: Record<string, number> = {};
    for (const entry of weeklyEntries) {
      const d = new Date(entry.date);
      const dow = d.getUTCDay();
      const startOfWeek = new Date(d.getTime() - dow * DAY_MS);
      const weekKey = startOfWeek.toISOString().slice(0, 10);
      weeklyMap[weekKey] = (weeklyMap[weekKey] || 0) + entry.count;
    }

    // Convert to array and get last 12 weeks
    const weekly = Object.entries(weeklyMap)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-12)
      .map(([week, count]) => ({
        week,
        count,
      }));

    return NextResponse.json({ daily, weekly });
  } catch (error) {
    console.error('Error fetching personal stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch personal stats' },
      { status: 500 }
    );
  }
}
