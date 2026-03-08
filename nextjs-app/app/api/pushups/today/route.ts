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
    const { searchParams } = new URL(request.url);
    const { sanitizeTimezone, todayAsUtcMidnight, DAY_MS } = await import('@/lib/timezone');
    const tz = sanitizeTimezone(searchParams.get('timezone'));
    const today = todayAsUtcMidnight(tz);
    const tomorrow = new Date(today.getTime() + DAY_MS);

    const entries = await prisma.pushupEntry.findMany({
      where: {
        userId: parseInt(auth.user!.id),
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
      orderBy: { date: 'desc' },
    });

    const totalCount = entries.reduce((sum, entry) => sum + entry.count, 0);

    return NextResponse.json({
      entries,
      totalCount,
      date: today,
    });
  } catch (error) {
    console.error('Error fetching today pushups:', error);
    return NextResponse.json(
      { error: 'Failed to fetch today pushups' },
      { status: 500 }
    );
  }
}
