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
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    if (!group) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      );
    }

    const isMember = group.members.some((m) => m.userId === userId);
    if (!isMember) {
      return NextResponse.json(
        { error: 'You are not a member of this group' },
        { status: 403 }
      );
    }

    const members = await prisma.groupMember.findMany({
      where: { groupId },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json(members);
  } catch (error) {
    console.error('Error fetching members:', error);
    return NextResponse.json(
      { error: 'Failed to fetch members' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
    const memberId = searchParams.get('memberId');

    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    if (!group) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      );
    }

    const isMember = group.members.some((m) => m.userId === userId);
    if (!isMember) {
      return NextResponse.json(
        { error: 'You are not a member of this group' },
        { status: 403 }
      );
    }

    const targetUserId = memberId ? parseInt(memberId) : userId;
    const currentMember = group.members.find((m) => m.userId === userId);
    const targetMember = group.members.find((m) => m.userId === targetUserId);

    if (!targetMember) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      );
    }

    // Only owners can remove other members
    if (targetUserId !== userId && currentMember?.role !== 'owner') {
      return NextResponse.json(
        { error: 'Only group owners can remove members' },
        { status: 403 }
      );
    }

    // Owner can't leave if they're the only owner
    if (targetMember.role === 'owner') {
      const ownerCount = group.members.filter((m) => m.role === 'owner').length;
      if (ownerCount === 1) {
        return NextResponse.json(
          { error: 'Cannot leave group as the only owner. Transfer ownership or delete the group.' },
          { status: 400 }
        );
      }
    }

    await prisma.groupMember.delete({
      where: {
        userId_groupId: {
          userId: targetUserId,
          groupId,
        },
      },
    });

    return NextResponse.json({ message: 'Successfully removed member' });
  } catch (error) {
    console.error('Error removing member:', error);
    return NextResponse.json(
      { error: 'Failed to remove member' },
      { status: 500 }
    );
  }
}
