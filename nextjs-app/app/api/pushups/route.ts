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

  const { searchParams } = new URL(request.url);
  const take = Math.min(parseInt(searchParams.get('take') || '30'), 100); // Max 100 per page
  const skip = parseInt(searchParams.get('skip') || '0');

  try {
    const [entries, total] = await Promise.all([
      prisma.pushupEntry.findMany({
        where: { userId: parseInt(auth.user!.id) },
        orderBy: { date: 'desc' },
        take,
        skip,
      }),
      prisma.pushupEntry.count({ where: { userId: parseInt(auth.user!.id) } }),
    ]);

    return NextResponse.json({
      entries,
      total,
      hasMore: skip + take < total,
    });
  } catch (error) {
    console.error('Error fetching pushups:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pushups' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth.error) {
    return NextResponse.json(
      { error: auth.message },
      { status: auth.status }
    );
  }

  try {
    const body = await request.json();
    const { count, date, timezone } = body;

    if (!count || typeof count !== 'number' || count < 0) {
      return NextResponse.json(
        { error: 'Valid count is required' },
        { status: 400 }
      );
    }

    const { sanitizeTimezone, toLocalDateString, localDateToUtcMidnight } = await import('@/lib/timezone');
    const tz = sanitizeTimezone(timezone);
    const refDate = date ? new Date(date) : new Date();
    const entryDate = localDateToUtcMidnight(toLocalDateString(refDate, tz));

    const entry = await prisma.pushupEntry.create({
      data: {
        userId: parseInt(auth.user!.id),
        count,
        date: entryDate,
      },
    });

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error('Error creating pushup entry:', error);
    return NextResponse.json(
      { error: 'Failed to create pushup entry' },
      { status: 500 }
    );
  }
}
