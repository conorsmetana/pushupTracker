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
    const since = new Date();
    since.setDate(since.getDate() - 29);
    since.setHours(0, 0, 0, 0);

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() - 11 * 7);
    weekStart.setHours(0, 0, 0, 0);

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
        const d = new Date(since);
        d.setDate(since.getDate() + i);
        const key = d.toISOString().slice(0, 10);
        return {
          date: key,
          count: m.user.pushupEntries
            .filter((e) => e.date.toISOString().slice(0, 10) === key)
            .reduce((sum, e) => sum + e.count, 0),
        };
      }),
      weekly: Array.from({ length: 12 }, (_, i) => {
        const start = new Date(weekStart);
        start.setDate(weekStart.getDate() + i * 7);
        const end = new Date(start);
        end.setDate(start.getDate() + 7);
        const key = start.toISOString().slice(0, 10);
        const count = m.user.pushupEntries
          .filter((e) => {
            const dt = e.date;
            return dt >= start && dt < end;
          })
          .reduce((sum, e) => sum + e.count, 0);
        return { week: key, count };
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
