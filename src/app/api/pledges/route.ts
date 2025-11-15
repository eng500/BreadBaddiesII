import { NextRequest, NextResponse } from 'next/server';
import { getDb, generateId } from '@/lib/db';
import { requireAuth } from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { post_id, amount } = body;

    if (!post_id || !amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Valid post ID and amount are required' },
        { status: 400 }
      );
    }

    const db = getDb();

    // Get post and check if active
    const post = db
      .prepare('SELECT * FROM posts WHERE id = ?')
      .get(post_id) as any;

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (post.status !== 'active') {
      return NextResponse.json(
        { error: 'This campaign is not accepting pledges' },
        { status: 400 }
      );
    }

    // Check if user is a member
    const member = db
      .prepare('SELECT id FROM community_members WHERE community_id = ? AND user_id = ? AND status = ?')
      .get(post.community_id, user.id, 'active');

    if (!member) {
      return NextResponse.json(
        { error: 'You must be a member to pledge' },
        { status: 403 }
      );
    }

    const pledgeId = generateId();

    // Create pledge with "authorized" status (simulating payment authorization)
    db.prepare(
      'INSERT INTO pledges (id, post_id, user_id, amount, status) VALUES (?, ?, ?, ?, ?)'
    ).run(pledgeId, post_id, user.id, amount, 'authorized');

    // Update post current amount
    const newAmount = post.current_amount + amount;
    db.prepare('UPDATE posts SET current_amount = ? WHERE id = ?')
      .run(newAmount, post_id);

    // Check if goal is met and update status
    if (newAmount >= post.goal_amount) {
      db.prepare('UPDATE posts SET status = ? WHERE id = ?')
        .run('funded', post_id);

      // In a real app, this would trigger payment capture
      // For demo, we'll just mark pledges as captured
      db.prepare('UPDATE pledges SET status = ? WHERE post_id = ?')
        .run('captured', post_id);
    }

    return NextResponse.json({ id: pledgeId, success: true });
  } catch (error) {
    console.error('Create pledge error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
