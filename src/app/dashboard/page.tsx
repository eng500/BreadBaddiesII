import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/auth/session';
import { getDb } from '@/lib/db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, TrendingUp } from 'lucide-react';
import { formatCurrency, calculateProgress } from '@/lib/utils';

export default async function DashboardPage() {
  const user = await getSession();

  if (!user) {
    redirect('/login');
  }

  const db = getDb();

  // Get user's community memberships
  const memberships = db
    .prepare('SELECT * FROM community_members WHERE user_id = ? AND status = ?')
    .all(user.id, 'active') as any[];

  // Get communities for those memberships
  const communities = memberships.map((membership) => {
    const community = db.prepare('SELECT * FROM communities WHERE id = ?').get(membership.community_id) as any;
    if (!community) return null;

    const leader = db.prepare('SELECT full_name, email FROM users WHERE id = ?').get(community.leader_id) as any;
    const memberCount = db.prepare('SELECT * FROM community_members WHERE community_id = ?').all(community.id).length;

    return {
      ...community,
      leader_name: leader?.full_name,
      leader_email: leader?.email,
      member_count: memberCount,
    };
  }).filter(Boolean);

  // Get active crowdfunding posts from user's communities
  const communityIds = memberships.map((m) => m.community_id);
  const allPosts = db.prepare('SELECT * FROM posts WHERE status = ?').all('active') as any[];
  const posts = allPosts
    .filter((post) => communityIds.includes(post.community_id))
    .slice(0, 5)
    .map((post) => {
      const community = db.prepare('SELECT name FROM communities WHERE id = ?').get(post.community_id) as any;
      return {
        ...post,
        community_name: community?.name,
      };
    });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user.full_name || user.email}!
        </h1>
        <p className="text-muted-foreground">
          Here's what's happening in your communities
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Your Communities
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{communities.length}</div>
            <p className="text-xs text-muted-foreground">
              Active memberships
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Campaigns
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{posts.length}</div>
            <p className="text-xs text-muted-foreground">
              Crowdfunding campaigns
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Communities Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">My Communities</h2>
            <Link href="/communities/create">
              <Button>Create New</Button>
            </Link>
          </div>
          <div className="space-y-4">
            {communities.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground text-center">
                    You haven't joined any communities yet.
                  </p>
                  <div className="text-center mt-4">
                    <Link href="/communities/create">
                      <Button>Create Your First Community</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ) : (
              communities.map((community) => (
                <Link
                  key={community.id}
                  href={`/communities/${community.id}`}
                >
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{community.name}</CardTitle>
                          <CardDescription className="mt-1">
                            {community.description}
                          </CardDescription>
                        </div>
                        {community.leader_id === user.id && (
                          <Badge>Leader</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                        <Users className="h-4 w-4" />
                        <span>{community.member_count} members</span>
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Active Campaigns Section */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Active Campaigns</h2>
          <div className="space-y-4">
            {posts.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground text-center">
                    No active crowdfunding campaigns.
                  </p>
                </CardContent>
              </Card>
            ) : (
              posts.map((post) => {
                const progress = calculateProgress(
                  post.current_amount,
                  post.goal_amount
                );
                return (
                  <Link
                    key={post.id}
                    href={`/communities/${post.community_id}/posts/${post.id}`}
                  >
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardHeader>
                        <Badge className="w-fit mb-2" variant="secondary">
                          {post.community_name}
                        </Badge>
                        <CardTitle className="text-lg">{post.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {post.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">{progress}%</span>
                          </div>
                          <Progress value={progress} />
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">
                              {formatCurrency(post.current_amount)}
                            </span>
                            <span className="text-muted-foreground">
                              of {formatCurrency(post.goal_amount)}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
