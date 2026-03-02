import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import type { Session } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function getSession(): Promise<Session | null> {
  return getServerSession(authOptions);
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user;
}

export async function requireAuth(request: NextRequest) {
  const session = await getSession();

  if (!session) {
    return {
      user: null,
      error: true,
      status: 401,
      message: 'Unauthorized',
    };
  }

  return {
    user: session.user,
    error: false,
    status: 200,
  };
}

export function withAuth(handler: Function) {
  return async (request: NextRequest) => {
    const auth = await requireAuth(request);

    if (auth.error) {
      return NextResponse.json(
        { error: auth.message },
        { status: auth.status }
      );
    }

    return handler(request, auth.user);
  };
}
