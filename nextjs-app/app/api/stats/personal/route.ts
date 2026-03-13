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
    const { sanitizeTimezone, toLocalDateString, localDateToLocalMidnightUtc, todayLocalStartUtc, localDateDayOfWeek, addDaysToDateStr, DAY_MS } = await import('@/lib/timezone');
    const tz = sanitizeTimezone(searchParams.get('timezone'));
    const todayStr = toLocalDateString(new Date(), tz);
    const today = localDateToLocalMidnightUtc(todayStr, tz);

    // Daily totals for last 30 days
    const sinceStr = addDaysToDateStr(todayStr, -29);
    const since = localDateToLocalMidnightUtc(sinceStr, tz);

    const entries = await prisma.pushupEntry.findMany({
      where: { userId, date: { gte: since } },
      orderBy: { date: 'asc' },
    });

    // Group by day (using local date in user's timezone)
    const dailyMap: Record<string, number> = {};
    for (let i = 0; i < 30; i++) {
      const key = addDaysToDateStr(sinceStr, i);
      dailyMap[key] = 0;
    }

    for (const entry of entries) {
      const key = toLocalDateString(entry.date, tz);
      if (key in dailyMap) {
        dailyMap[key] += entry.count;
      }
    }

    // Convert to array format for charts
    const daily = Object.entries(dailyMap).map(([date, count]) => ({
      date,
      count,
    }));

    // Weekly totals for last 12 weeks
    const todayDow = localDateDayOfWeek(todayStr);
    const sundayStr = addDaysToDateStr(todayStr, -todayDow);
    const weeklyStartStr = addDaysToDateStr(sundayStr, -11 * 7);
    const weeklyStart = localDateToLocalMidnightUtc(weeklyStartStr, tz);

    const weeklyEntries = await prisma.pushupEntry.findMany({
      where: { userId, date: { gte: weeklyStart } },
      orderBy: { date: 'asc' },
    });

    // Group by week (Sunday start, using local date in user's timezone)
    const weeklyMap: Record<string, number> = {};
    for (const entry of weeklyEntries) {
      const entryLocalDate = toLocalDateString(entry.date, tz);
      const entryDow = localDateDayOfWeek(entryLocalDate);
      const weekKey = addDaysToDateStr(entryLocalDate, -entryDow);
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
