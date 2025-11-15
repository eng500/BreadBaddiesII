'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency, calculateProgress, formatDate } from '@/lib/utils';

export default function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string; postId: string }>;
}) {
  const { id, postId } = use(params);
  const router = useRouter();
  const [post, setPost] = useState<any>(null);
  const [pledges, setPledges] = useState<any[]>([]);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/posts/${postId}`)
      .then((res) => res.json())
      .then((data) => {
        setPost(data.post);
        setPledges(data.pledges);
      })
      .catch(() => setError('Failed to load post'));
  }, [postId]);

  const handlePledge = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/pledges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post_id: postId,
          amount: parseFloat(amount),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create pledge');
        return;
      }

      router.refresh();
      setAmount('');

      // Reload post data
      const postRes = await fetch(`/api/posts/${postId}`);
      const postData = await postRes.json();
      setPost(postData.post);
      setPledges(postData.pledges);
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Loading...</p>
      </div>
    );
  }

  const progress = calculateProgress(post.current_amount, post.goal_amount);
  const daysLeft = Math.ceil(
    (new Date(post.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-3xl mb-2">{post.title}</CardTitle>
                <CardDescription className="text-base">
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
                {post.status.toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="h-3" />
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <div className="text-3xl font-bold">
                  {formatCurrency(post.current_amount)}
                </div>
                <div className="text-sm text-muted-foreground">
                  pledged of {formatCurrency(post.goal_amount)} goal
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold">{pledges.length}</div>
                <div className="text-sm text-muted-foreground">backers</div>
              </div>
              <div>
                <div className="text-3xl font-bold">
                  {daysLeft > 0 ? daysLeft : 0}
                </div>
                <div className="text-sm text-muted-foreground">
                  days to go
                </div>
              </div>
            </div>

            {post.status === 'active' && (
              <Card className="bg-muted">
                <CardHeader>
                  <CardTitle className="text-lg">Make a Pledge</CardTitle>
                  <CardDescription>
                    Support this campaign. Your payment will only be processed if the
                    funding goal is met by {formatDate(post.deadline)}.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePledge} className="space-y-4">
                    <div>
                      <Label htmlFor="amount">Pledge Amount ($)</Label>
                      <Input
                        id="amount"
                        type="number"
                        min="1"
                        step="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                        placeholder="25.00"
                      />
                    </div>
                    {error && <p className="text-sm text-destructive">{error}</p>}
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Processing...' : 'Pledge Now'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {post.status === 'funded' && (
              <Card className="bg-green-50 border-green-200">
                <CardContent className="pt-6">
                  <p className="text-green-800 font-medium text-center">
                    🎉 This campaign has been successfully funded! All pledges have been
                    processed.
                  </p>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Backers ({pledges.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {pledges.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No backers yet. Be the first to support this campaign!
              </p>
            ) : (
              <div className="space-y-3">
                {pledges.map((pledge) => (
                  <div
                    key={pledge.id}
                    className="flex items-center justify-between p-3 bg-muted rounded"
                  >
                    <span className="font-medium">
                      {pledge.user_name || pledge.user_email}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold">
                        {formatCurrency(pledge.amount)}
                      </span>
                      <Badge variant="outline">{pledge.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
