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
    const { searchParams } = new URL(request.url);
    const period = (searchParams.get('period') || 'week') as 'today' | 'week' | 'month';

    // Verify user is a member
    const group = await prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      );
    }

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

    const members = await prisma.groupMember.findMany({
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

    return NextResponse.json({
      period,
      startDate,
      leaderboard,
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
