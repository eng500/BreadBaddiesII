import { NextRequest, NextResponse } from 'next/server';
import { deleteSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';

export async function POST(request: NextRequest) {
  await deleteSession();
  redirect('/');
}
