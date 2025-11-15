import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Vote, DollarSign } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold mb-6">
          Build Communities. Fund Dreams Together.
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Create or join communities, propose ideas, vote on proposals, and crowdfund projects
          that matter to your group. Only pay when funding goals are met.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/signup">
            <Button size="lg">Get Started</Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline">
              Login
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-muted py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Users className="h-12 w-12 mb-4 text-primary" />
                <CardTitle>Create & Join Communities</CardTitle>
                <CardDescription>
                  Start your own community or join existing ones. Perfect for groups, clubs,
                  neighborhoods, and shared workspaces.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Vote className="h-12 w-12 mb-4 text-primary" />
                <CardTitle>Propose & Vote</CardTitle>
                <CardDescription>
                  Share ideas through a bulletin board system. Members vote on proposals
                  to decide what projects to pursue together.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <DollarSign className="h-12 w-12 mb-4 text-primary" />
                <CardTitle>Fund Together</CardTitle>
                <CardDescription>
                  Create crowdfunding campaigns for approved projects. Smart payment
                  authorization only charges when funding goals are met.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Perfect For</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Group Trips</CardTitle>
              <CardDescription>
                Plan and fund travel adventures together
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Club Events</CardTitle>
              <CardDescription>
                Organize and finance community events
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Shared Spaces</CardTitle>
              <CardDescription>
                Upgrade workspace or living areas together
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Community Projects</CardTitle>
              <CardDescription>
                Fund local initiatives and improvements
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-lg mb-8">
            Join communities or create your own today. It's free!
          </p>
          <Link href="/signup">
            <Button size="lg" variant="secondary">
              Create Your Account
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
