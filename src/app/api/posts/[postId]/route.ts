import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
    const db = getDb();

    const post = db
      .prepare('SELECT * FROM posts WHERE id = ?')
      .get(postId) as any;

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const pledges = db
      .prepare(`
        SELECT p.*, u.full_name as user_name, u.email as user_email
        FROM pledges p
        JOIN users u ON p.user_id = u.id
        WHERE p.post_id = ?
        ORDER BY p.created_at DESC
      `)
      .all(postId) as any[];

    return NextResponse.json({ post, pledges });
  } catch (error) {
    console.error('Get post error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
