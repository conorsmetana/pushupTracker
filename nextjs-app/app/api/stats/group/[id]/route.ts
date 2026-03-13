import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await requireAuth(request);
  if (auth.error) {
    return NextResponse.json(
      { error: auth.message },
      { status: auth.status }
    );
  }

  try {
    const groupId = parseInt(id);
    const userId = parseInt(auth.user!.id);

    // Verify user is a member
    const isMember = await prisma.groupMember.findUnique({
      where: {
        userId_groupId: {
          userId,
          groupId,
        },
      },
    });

    if (!isMember) {
      return NextResponse.json(
        { error: 'You are not a member of this group' },
        { status: 403 }
      );
    }

    // Aggregate group member stats for last 30 days and last 12 weeks
    const { searchParams } = new URL(request.url);
    const { sanitizeTimezone, toLocalDateString, localDateToLocalMidnightUtc, localDateDayOfWeek, addDaysToDateStr, DAY_MS } = await import('@/lib/timezone');
    const tz = sanitizeTimezone(searchParams.get('timezone'));
    const todayStr = toLocalDateString(new Date(), tz);
    const sinceStr = addDaysToDateStr(todayStr, -29);
    const since = localDateToLocalMidnightUtc(sinceStr, tz);
    const todayDow = localDateDayOfWeek(todayStr);
    const sundayStr = addDaysToDateStr(todayStr, -todayDow);
    const weekStartStr = addDaysToDateStr(sundayStr, -11 * 7);

    const members = await prisma.groupMember.findMany({
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
        const key = addDaysToDateStr(sinceStr, i);
        return {
          date: key,
          count: m.user.pushupEntries
            .filter((e) => toLocalDateString(e.date, tz) === key)
            .reduce((sum, e) => sum + e.count, 0),
        };
      }),
      weekly: Array.from({ length: 12 }, (_, i) => {
        const weekKeyStr = addDaysToDateStr(weekStartStr, i * 7);
        const weekStartUtc = localDateToLocalMidnightUtc(weekKeyStr, tz);
        const weekEndUtc = localDateToLocalMidnightUtc(addDaysToDateStr(weekKeyStr, 7), tz);
        const count = m.user.pushupEntries
          .filter((e) => {
            return e.date >= weekStartUtc && e.date < weekEndUtc;
          })
          .reduce((sum, e) => sum + e.count, 0);
        return { week: weekKeyStr, count };
      }),
    }));

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching group stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch group stats' },
      { status: 500 }
    );
  }
}
