import { NextRequest, NextResponse } from 'next/server';
import { getDb, generateId } from '@/lib/db';
import { requireAuth } from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { community_id, title, description, goal_amount, deadline } = body;

    if (!community_id || !title || !goal_amount || !deadline) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    const db = getDb();

    // Check if user is the leader
    const community = db
      .prepare('SELECT leader_id FROM communities WHERE id = ?')
      .get(community_id) as any;

    if (!community || community.leader_id !== user.id) {
      return NextResponse.json(
        { error: 'Only community leaders can create posts' },
        { status: 403 }
      );
    }

    const postId = generateId();

    db.prepare(
      'INSERT INTO posts (id, community_id, title, description, goal_amount, deadline, status) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(postId, community_id, title, description || null, goal_amount, deadline, 'active');

    return NextResponse.json({ id: postId, success: true });
  } catch (error) {
    console.error('Create post error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
