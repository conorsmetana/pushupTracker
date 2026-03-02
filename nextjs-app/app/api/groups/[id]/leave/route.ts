import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

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

    const currentMember = group.members.find((m) => m.userId === userId);
    const targetMember = group.members.find((m) => m.userId === userId);

    if (!targetMember) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
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
          userId,
          groupId,
        },
      },
    });

    return NextResponse.json({ message: 'Successfully left the group' });
  } catch (error) {
    console.error('Error leaving group:', error);
    return NextResponse.json(
      { error: 'Failed to leave group' },
      { status: 500 }
    );
  }
}
