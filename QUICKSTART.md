# Quick Start Guide

## Your Community Crowdfunding Platform is Ready! 🎉

The application is currently running at: **http://localhost:3000**

## What You Can Do Right Now

### 1. Login with Demo Accounts
Use any of these pre-configured accounts:
- **alice@demo.com** / password
- **bob@demo.com** / password
- **charlie@demo.com** / password
- **diana@demo.com** / password

### 2. Explore Pre-Loaded Demo Data
The platform comes with:
- ✅ 3 communities (Adventure Travelers, Tech Workspace, Community Garden)
- ✅ Multiple proposals with votes
- ✅ 3 active crowdfunding campaigns
- ✅ Sample pledges from community members

## Key Features to Try

### Communities
1. **View Communities**: Check out existing communities from the dashboard
2. **Create Community**: Click "Create Community" in the nav bar
3. **Join Communities**: Public communities auto-add you as a member

### Proposals (Bulletin Board)
1. **View Proposals**: Go to any community and click the "Proposals" tab
2. **Vote**: Upvote or downvote proposals with the arrow buttons
3. **Create Proposal**: Click "Create Proposal" to share your ideas

### Crowdfunding Campaigns
1. **View Campaigns**: Click the "Crowdfunding Posts" tab in any community
2. **Make a Pledge**: Click "View Campaign" and pledge any amount
3. **Track Progress**: Watch the progress bar fill up
4. **Smart Payments**: Funds are only "captured" when goals are met!
5. **Create Campaign** (Leaders only): Click "Create Campaign" if you're a community leader

## Commands

### Development
```bash
npm run dev      # Start development server (already running!)
npm run seed     # Reset and re-seed the database
npm run build    # Build for production
npm start        # Run production build
```

### Stop the Server
Press `Ctrl + C` in the terminal running the dev server

## Database

- **Location**: `/Users/artemisprime/Documents/community-platform/database.json`
- **Type**: JSON file (human-readable)
- **Reset**: Run `npm run seed` to start fresh with demo data

## Project Structure

```
community-platform/
├── src/
│   ├── app/              # Pages and API routes
│   ├── components/ui/    # Reusable UI components
│   ├── lib/             # Utilities and database
│   └── types/           # TypeScript types
├── database.json        # Your local database
└── README.md           # Full documentation
```

## Testing Scenarios

### Scenario 1: Community Leader
1. Login as **alice@demo.com**
2. Go to "Adventure Travelers" community
3. Create a new crowdfunding campaign
4. Watch other members pledge to it

### Scenario 2: Community Member
1. Login as **bob@demo.com**
2. Browse different communities
3. Vote on proposals
4. Pledge to active crowdfunding campaigns

### Scenario 3: New User Experience
1. Click "Sign Up" in the nav
2. Create a new account
3. Create your own community
4. Invite friends (by having them join)

## What Makes This Special

✨ **100% Local** - No cloud services, databases, or API keys needed
✨ **Smart Crowdfunding** - Conditional payment capture (only charge when funded)
✨ **Community-Driven** - Proposals, voting, and collaborative funding
✨ **Modern Stack** - Next.js 15, TypeScript, Tailwind CSS, shadcn/ui

## Common Tasks

### Creating a Crowdfunding Campaign
1. Be a leader of a community (alice, bob, or charlie in the demo)
2. Navigate to your community
3. Click "Create Campaign" button
4. Fill in title, description, goal amount, and deadline
5. Submit and start collecting pledges!

### Making a Pledge
1. Go to any active crowdfunding campaign
2. Enter your pledge amount
3. Click "Pledge Now"
4. Your funds are authorized but NOT captured
5. When the goal is met, all pledges are captured automatically

### Voting on Proposals
1. Go to a community's "Proposals" tab
2. Click the up/down arrows to vote
3. Click again to remove your vote
4. See the vote count update in real-time

## Next Steps

- Read the full [README.md](README.md) for technical details
- Experiment with creating your own communities
- Try the crowdfunding workflow end-to-end
- Customize the design and add new features!

## Need Help?

Check out:
- Full documentation: [README.md](README.md)
- Project structure above
- Demo data in `database.json`

---

**Enjoy your community crowdfunding platform!** 🚀
