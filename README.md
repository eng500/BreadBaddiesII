# Community Crowdfunding Platform

A modern, full-stack community crowdfunding platform where users can create or join communities, propose ideas through a bulletin board system, vote on proposals, and create crowdfunding campaigns.

## Features

- **Communities**: Create public/private communities with role-based access
- **Proposals**: Submit and vote on community proposals
- **Crowdfunding**: Create campaigns with smart conditional charging (only charge when goals are met)
- **Authentication**: Secure session-based authentication
- **Real-time Updates**: Track funding progress and community activity

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui with Radix UI primitives
- **Database**: SQLite with better-sqlite3 (local, no external dependencies)
- **Authentication**: Session-based with bcrypt

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Clone or navigate to the project directory**:
   ```bash
   cd community-platform
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Initialize the database**:
   ```bash
   npm run db:init
   ```

4. **Seed the database with demo data**:
   ```bash
   npm run db:seed
   ```

5. **Start the development server**:
   ```bash
   npm run dev
   ```

6. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Demo Accounts

After seeding the database, you can login with these accounts:

- **alice@demo.com** / password
- **bob@demo.com** / password
- **charlie@demo.com** / password
- **diana@demo.com** / password

## Project Structure

```
community-platform/
├── src/
│   ├── app/                      # Next.js App Router pages
│   │   ├── api/                  # API routes
│   │   ├── communities/          # Community pages
│   │   ├── dashboard/            # User dashboard
│   │   ├── login/                # Login page
│   │   └── signup/               # Signup page
│   ├── components/ui/            # Reusable UI components
│   ├── lib/
│   │   ├── auth/                 # Authentication utilities
│   │   ├── db/                   # Database utilities
│   │   └── utils.ts              # Helper functions
│   └── types/                    # TypeScript types
├── database.sqlite               # SQLite database (created after init)
└── package.json
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:init` - Initialize database schema
- `npm run db:seed` - Seed database with demo data
- `npm run lint` - Run ESLint

## Key Features Explained

### Smart Crowdfunding

When a user pledges to a campaign:
1. Payment is authorized (mock authorization in demo)
2. Funds are NOT immediately captured
3. When the funding goal is met:
   - Campaign status changes to "funded"
   - All pledges are captured
4. If the deadline passes without meeting the goal:
   - Campaign expires
   - All authorizations are released

### Community Roles

- **Leader**: Can create crowdfunding campaigns and manage the community
- **Member**: Can create proposals, vote, and pledge to campaigns

### Proposals & Voting

- Any member can create a proposal
- Members can upvote or downvote proposals
- Each user gets one vote per proposal
- Voting again with the same type removes the vote

## Database Schema

The SQLite database includes these main tables:

- `users` - User accounts
- `communities` - Community information
- `community_members` - User-community relationships
- `proposals` - Community proposals
- `proposal_votes` - Proposal voting
- `posts` - Crowdfunding campaigns
- `pledges` - User pledges/contributions
- `comments` - Post comments (basic structure)
- `sessions` - User sessions

## Development Notes

- **Local Database**: Everything runs locally with SQLite (no cloud services needed)
- **No External APIs**: Authentication and payments are fully mocked
- **Session-based Auth**: Sessions are stored in the database
- **Type Safety**: Full TypeScript coverage

## Production Considerations

This is a demo application. For production use, consider:

- Replace SQLite with PostgreSQL or similar
- Implement real payment processing (Stripe, etc.)
- Add OAuth providers for authentication
- Implement proper error handling and logging
- Add rate limiting and security headers
- Set up proper environment variables
- Add comprehensive tests
- Implement email notifications
- Add image upload functionality
- Implement search and filtering

## License

MIT

## Support

For issues or questions, please open an issue in the repository.
