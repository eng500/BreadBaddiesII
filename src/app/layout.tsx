import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { getSession } from "@/lib/auth/session";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Community Platform - Crowdfund Together",
  description: "Create communities, propose ideas, vote, and crowdfund projects together",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getSession();

  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="border-b bg-background">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="text-xl font-bold">
              CommunityFund
            </Link>
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <Link href="/dashboard">
                    <Button variant="ghost">Dashboard</Button>
                  </Link>
                  <Link href="/communities/create">
                    <Button variant="ghost">Create Community</Button>
                  </Link>
                  <form action="/api/auth/logout" method="POST">
                    <Button variant="outline" type="submit">
                      Logout
                    </Button>
                  </form>
                  <span className="text-sm text-muted-foreground">
                    {user.full_name || user.email}
                  </span>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost">Login</Button>
                  </Link>
                  <Link href="/signup">
                    <Button>Sign Up</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}
