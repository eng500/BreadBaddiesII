import { NextRequest, NextResponse } from 'next/server';
import { getDb, generateId } from '@/lib/db';
import { requireAuth } from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { name, description, is_private } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Community name is required' },
        { status: 400 }
      );
    }

    const db = getDb();
    const communityId = generateId();

    // Create community
    db.prepare(
      'INSERT INTO communities (id, name, description, leader_id, is_private) VALUES (?, ?, ?, ?, ?)'
    ).run(communityId, name, description || null, user.id, is_private ? 1 : 0);

    // Add leader as member
    const memberId = generateId();
    db.prepare(
      'INSERT INTO community_members (id, community_id, user_id, role, status) VALUES (?, ?, ?, ?, ?)'
    ).run(memberId, communityId, user.id, 'leader', 'active');

    return NextResponse.json({ id: communityId, success: true });
  } catch (error) {
    console.error('Create community error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
