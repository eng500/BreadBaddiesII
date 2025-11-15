import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getDb } from '@/lib/db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, ArrowUp, ArrowDown } from 'lucide-react';
import { formatCurrency, calculateProgress, formatRelativeTime } from '@/lib/utils';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function CommunityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getSession();
  if (!user) redirect('/login');

  const { id } = await params;
  const db = getDb();

  // Get community info
  const community = db.prepare('SELECT * FROM communities WHERE id = ?').get(id) as any;

  if (!community) {
    redirect('/dashboard');
  }

  // Get leader info
  const leader = db.prepare('SELECT full_name, email FROM users WHERE id = ?').get(community.leader_id) as any;
  community.leader_name = leader?.full_name;
  community.leader_email = leader?.email;

  // Check if user is a member
  let membership = db
    .prepare('SELECT * FROM community_members WHERE community_id = ? AND user_id = ? AND status = ?')
    .get(id, user.id, 'active') as any;

  if (!membership && !community.is_private) {
    // Auto-join public communities
    const { generateId } = await import('@/lib/db');
    const memberId = generateId();
    db.prepare(
      'INSERT INTO community_members (id, community_id, user_id, role, status) VALUES (?, ?, ?, ?, ?)'
    ).run(memberId, id, user.id, 'member', 'active');

    // Refetch membership
    membership = db
      .prepare('SELECT * FROM community_members WHERE community_id = ? AND user_id = ?')
      .get(id, user.id) as any;
  }

  const isLeader = community.leader_id === user.id;
  const isMember = !!membership;

  // Get proposals
  const allProposals = db.prepare('SELECT * FROM proposals WHERE community_id = ?').all(id) as any[];
  const proposals = allProposals.map((proposal) => {
    const author = db.prepare('SELECT full_name, email FROM users WHERE id = ?').get(proposal.user_id) as any;
    const votes = db.prepare('SELECT * FROM proposal_votes WHERE proposal_id = ?').all(proposal.id) as any[];
    const userVote = votes.find((v) => v.user_id === user.id);

    return {
      ...proposal,
      author_name: author?.full_name,
      author_email: author?.email,
      upvotes: votes.filter((v) => v.vote_type === 'upvote').length,
      downvotes: votes.filter((v) => v.vote_type === 'downvote').length,
      user_vote: userVote?.vote_type || null,
    };
  });

  // Get crowdfunding posts
  const posts = db.prepare('SELECT * FROM posts WHERE community_id = ?').all(id) as any[];

  // Get members
  const memberRecords = db.prepare('SELECT * FROM community_members WHERE community_id = ? AND status = ?').all(id, 'active') as any[];
  const members = memberRecords.map((member) => {
    const userInfo = db.prepare('SELECT full_name, email FROM users WHERE id = ?').get(member.user_id) as any;
    return {
      ...member,
      full_name: userInfo?.full_name,
      email: userInfo?.email,
    };
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-3xl">{community.name}</CardTitle>
              <CardDescription className="mt-2 text-base">
                {community.description}
              </CardDescription>
              <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{members.length} members</span>
                </div>
                <span>•</span>
                <span>Led by {community.leader_name || community.leader_email}</span>
              </div>
            </div>
            {community.is_private && <Badge variant="secondary">Private</Badge>}
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="posts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="posts">Crowdfunding Posts</TabsTrigger>
          <TabsTrigger value="proposals">Proposals</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Crowdfunding Campaigns</h2>
            {isLeader && (
              <Link href={`/communities/${id}/posts/create`}>
                <Button>Create Campaign</Button>
              </Link>
            )}
          </div>
          {posts.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground text-center">
                  No crowdfunding campaigns yet.
                  {isLeader && ' Create one to get started!'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {posts.map((post) => {
                const progress = calculateProgress(post.current_amount, post.goal_amount);
                return (
                  <Card key={post.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle>{post.title}</CardTitle>
                          <CardDescription className="mt-1">
                            {post.description}
                          </CardDescription>
                        </div>
                        <Badge
                          variant={
                            post.status === 'funded' ? 'default' :
                            post.status === 'active' ? 'secondary' :
                            'outline'
                          }
                        >
                          {post.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">{progress}%</span>
                          </div>
                          <Progress value={progress} />
                        </div>
                        <div className="flex justify-between items-end">
                          <div>
                            <div className="text-2xl font-bold">
                              {formatCurrency(post.current_amount)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              of {formatCurrency(post.goal_amount)} goal
                            </div>
                          </div>
                          <Link href={`/communities/${id}/posts/${post.id}`}>
                            <Button>View Campaign</Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="proposals" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Community Proposals</h2>
            <Link href={`/communities/${id}/proposals/create`}>
              <Button>Create Proposal</Button>
            </Link>
          </div>
          {proposals.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground text-center">
                  No proposals yet. Create one to share your ideas!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {proposals.map((proposal) => (
                <Card key={proposal.id}>
                  <CardHeader>
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center gap-1 min-w-[60px]">
                        <form action={`/api/votes?proposalId=${proposal.id}&type=upvote`} method="POST">
                          <button
                            type="submit"
                            className={`p-1 rounded hover:bg-muted ${
                              proposal.user_vote === 'upvote' ? 'text-green-600' : ''
                            }`}
                          >
                            <ArrowUp className="h-5 w-5" />
                          </button>
                        </form>
                        <span className="font-bold text-lg">
                          {proposal.upvotes - proposal.downvotes}
                        </span>
                        <form action={`/api/votes?proposalId=${proposal.id}&type=downvote`} method="POST">
                          <button
                            type="submit"
                            className={`p-1 rounded hover:bg-muted ${
                              proposal.user_vote === 'downvote' ? 'text-red-600' : ''
                            }`}
                          >
                            <ArrowDown className="h-5 w-5" />
                          </button>
                        </form>
                      </div>
                      <div className="flex-1">
                        <CardTitle>{proposal.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {proposal.description}
                        </CardDescription>
                        <p className="text-sm text-muted-foreground mt-2">
                          Proposed by {proposal.author_name || proposal.author_email} •{' '}
                          {formatRelativeTime(proposal.created_at)}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="members" className="space-y-4">
          <h2 className="text-2xl font-bold">Members ({members.length})</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map((member) => (
              <Card key={member.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">
                        {member.full_name || member.email}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {member.email}
                      </CardDescription>
                    </div>
                    {member.role === 'leader' && <Badge>Leader</Badge>}
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
