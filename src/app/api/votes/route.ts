import { NextRequest, NextResponse } from 'next/server';
import { getDb, generateId } from '@/lib/db';
import { requireAuth } from '@/lib/auth/session';
import { redirect } from 'next/navigation';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const searchParams = request.nextUrl.searchParams;
    const proposalId = searchParams.get('proposalId');
    const voteType = searchParams.get('type');

    if (!proposalId || !voteType || !['upvote', 'downvote'].includes(voteType)) {
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      );
    }

    const db = getDb();

    // Get proposal and community
    const proposal = db
      .prepare('SELECT community_id FROM proposals WHERE id = ?')
      .get(proposalId) as any;

    if (!proposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
    }

    // Check existing vote
    const existingVote = db
      .prepare('SELECT id, vote_type FROM proposal_votes WHERE proposal_id = ? AND user_id = ?')
      .get(proposalId, user.id) as any;

    if (existingVote) {
      if (existingVote.vote_type === voteType) {
        // Remove vote if clicking same type
        db.prepare('DELETE FROM proposal_votes WHERE id = ?').run(existingVote.id);
      } else {
        // Update vote type
        db.prepare('UPDATE proposal_votes SET vote_type = ? WHERE id = ?')
          .run(voteType, existingVote.id);
      }
    } else {
      // Create new vote
      const voteId = generateId();
      db.prepare(
        'INSERT INTO proposal_votes (id, proposal_id, user_id, vote_type) VALUES (?, ?, ?, ?)'
      ).run(voteId, proposalId, user.id, voteType);
    }

    redirect(`/communities/${proposal.community_id}`);
  } catch (error: any) {
    if (error.message === 'NEXT_REDIRECT') {
      throw error;
    }
    console.error('Vote error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
