import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function Home() {
  const session = await getSession();

  // If user is authenticated, redirect to dashboard
  if (session) {
    redirect('/');
  }

  // This shouldn't be reached due to middleware, but redirect to login just in case
  redirect('/login');
}
