import { NextRequest, NextResponse } from 'next/server';
import { getDb, generateId } from '@/lib/db';
import { requireAuth } from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { community_id, title, description } = body;

    if (!community_id || !title) {
      return NextResponse.json(
        { error: 'Community ID and title are required' },
        { status: 400 }
      );
    }

    const db = getDb();

    // Check if user is a member
    const member = db
      .prepare('SELECT id FROM community_members WHERE community_id = ? AND user_id = ? AND status = ?')
      .get(community_id, user.id, 'active');

    if (!member) {
      return NextResponse.json(
        { error: 'You must be a member to create proposals' },
        { status: 403 }
      );
    }

    const proposalId = generateId();

    db.prepare(
      'INSERT INTO proposals (id, community_id, user_id, title, description) VALUES (?, ?, ?, ?, ?)'
    ).run(proposalId, community_id, user.id, title, description || null);

    return NextResponse.json({ id: proposalId, success: true });
  } catch (error) {
    console.error('Create proposal error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
