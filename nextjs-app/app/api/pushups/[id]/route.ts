import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function PUT(
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
    const numId = parseInt(id);
    const body = await request.json();
    const { count } = body;

    if (!count || typeof count !== 'number' || count < 0) {
      return NextResponse.json(
        { error: 'Valid count is required' },
        { status: 400 }
      );
    }

    const entry = await prisma.pushupEntry.findUnique({
      where: { id: numId },
    });

    if (!entry) {
      return NextResponse.json(
        { error: 'Entry not found' },
        { status: 404 }
      );
    }

    if (entry.userId !== parseInt(auth.user!.id)) {
      return NextResponse.json(
        { error: 'Not authorized to update this entry' },
        { status: 403 }
      );
    }

    const updated = await prisma.pushupEntry.update({
      where: { id: numId },
      data: { count },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating pushup entry:', error);
    return NextResponse.json(
      { error: 'Failed to update pushup entry' },
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
    const numId = parseInt(id);

    const entry = await prisma.pushupEntry.findUnique({
      where: { id: numId },
    });

    if (!entry) {
      return NextResponse.json(
        { error: 'Entry not found' },
        { status: 404 }
      );
    }

    if (entry.userId !== parseInt(auth.user!.id)) {
      return NextResponse.json(
        { error: 'Not authorized to delete this entry' },
        { status: 403 }
      );
    }

    await prisma.pushupEntry.delete({
      where: { id: numId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting pushup entry:', error);
    return NextResponse.json(
      { error: 'Failed to delete pushup entry' },
      { status: 500 }
    );
  }
}
