const fs = require('fs');
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, '../../../database.json');

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Initialize empty database
const db = {
  users: [],
  communities: [],
  community_members: [],
  proposals: [],
  proposal_votes: [],
  posts: [],
  pledges: [],
  comments: [],
  sessions: [],
};

console.log('Creating demo data...');

// Create users
console.log('Creating users...');
const users = [
  { id: generateId(), email: 'alice@demo.com', password: bcrypt.hashSync('password', 10), full_name: 'Alice Johnson', avatar_url: null },
  { id: generateId(), email: 'bob@demo.com', password: bcrypt.hashSync('password', 10), full_name: 'Bob Smith', avatar_url: null },
  { id: generateId(), email: 'charlie@demo.com', password: bcrypt.hashSync('password', 10), full_name: 'Charlie Brown', avatar_url: null },
  { id: generateId(), email: 'diana@demo.com', password: bcrypt.hashSync('password', 10), full_name: 'Diana Prince', avatar_url: null },
];

db.users = users;

// Create communities
console.log('Creating communities...');
const communities = [
  {
    id: generateId(),
    name: 'Adventure Travelers',
    description: 'Group travel enthusiasts planning trips together',
    leader_id: users[0].id,
    is_private: 0
  },
  {
    id: generateId(),
    name: 'Tech Workspace',
    description: 'Shared workspace for tech professionals',
    leader_id: users[1].id,
    is_private: 0
  },
  {
    id: generateId(),
    name: 'Community Garden',
    description: 'Local gardening community for shared resources',
    leader_id: users[2].id,
    is_private: 0
  },
];

db.communities = communities;

// Add community members (including leaders)
console.log('Adding community members...');
const members = [];

// Adventure Travelers members
members.push({ id: generateId(), community_id: communities[0].id, user_id: users[0].id, role: 'leader', status: 'active' });
members.push({ id: generateId(), community_id: communities[0].id, user_id: users[1].id, role: 'member', status: 'active' });
members.push({ id: generateId(), community_id: communities[0].id, user_id: users[2].id, role: 'member', status: 'active' });

// Tech Workspace members
members.push({ id: generateId(), community_id: communities[1].id, user_id: users[1].id, role: 'leader', status: 'active' });
members.push({ id: generateId(), community_id: communities[1].id, user_id: users[0].id, role: 'member', status: 'active' });
members.push({ id: generateId(), community_id: communities[1].id, user_id: users[3].id, role: 'member', status: 'active' });

// Community Garden members
members.push({ id: generateId(), community_id: communities[2].id, user_id: users[2].id, role: 'leader', status: 'active' });
members.push({ id: generateId(), community_id: communities[2].id, user_id: users[3].id, role: 'member', status: 'active' });

db.community_members = members;

// Create proposals
console.log('Creating proposals...');
const proposals = [
  {
    id: generateId(),
    community_id: communities[0].id,
    user_id: users[1].id,
    title: 'Trip to Iceland',
    description: 'Let\'s plan a group trip to Iceland to see the Northern Lights!'
  },
  {
    id: generateId(),
    community_id: communities[0].id,
    user_id: users[2].id,
    title: 'Camping in Yosemite',
    description: 'Weekend camping trip to Yosemite National Park'
  },
  {
    id: generateId(),
    community_id: communities[1].id,
    user_id: users[3].id,
    title: 'New Standing Desks',
    description: 'Proposal to buy adjustable standing desks for the workspace'
  },
];

db.proposals = proposals;

// Add votes to proposals
console.log('Adding proposal votes...');
const votes = [];

// Iceland trip votes
votes.push({ id: generateId(), proposal_id: proposals[0].id, user_id: users[0].id, vote_type: 'upvote' });
votes.push({ id: generateId(), proposal_id: proposals[0].id, user_id: users[1].id, vote_type: 'upvote' });
votes.push({ id: generateId(), proposal_id: proposals[0].id, user_id: users[2].id, vote_type: 'upvote' });

// Yosemite votes
votes.push({ id: generateId(), proposal_id: proposals[1].id, user_id: users[0].id, vote_type: 'upvote' });
votes.push({ id: generateId(), proposal_id: proposals[1].id, user_id: users[1].id, vote_type: 'downvote' });

// Standing desks votes
votes.push({ id: generateId(), proposal_id: proposals[2].id, user_id: users[0].id, vote_type: 'upvote' });
votes.push({ id: generateId(), proposal_id: proposals[2].id, user_id: users[1].id, vote_type: 'upvote' });
votes.push({ id: generateId(), proposal_id: proposals[2].id, user_id: users[3].id, vote_type: 'upvote' });

db.proposal_votes = votes;

// Create crowdfunding posts
console.log('Creating crowdfunding posts...');
const futureDate = new Date();
futureDate.setDate(futureDate.getDate() + 30);

const posts = [
  {
    id: generateId(),
    community_id: communities[0].id,
    title: 'Iceland Adventure 2024',
    description: 'Funding for our group trip to Iceland including flights, accommodation, and activities.',
    goal_amount: 5000,
    current_amount: 2500,
    deadline: futureDate.toISOString(),
    status: 'active'
  },
  {
    id: generateId(),
    community_id: communities[1].id,
    title: 'Workspace Equipment Upgrade',
    description: 'New monitors, keyboards, and ergonomic chairs for our shared workspace.',
    goal_amount: 3000,
    current_amount: 1500,
    deadline: futureDate.toISOString(),
    status: 'active'
  },
  {
    id: generateId(),
    community_id: communities[2].id,
    title: 'Garden Tools & Supplies',
    description: 'Quality tools and supplies for our community garden project.',
    goal_amount: 1000,
    current_amount: 800,
    deadline: futureDate.toISOString(),
    status: 'active'
  },
];

db.posts = posts;

// Create pledges
console.log('Creating pledges...');
const pledges = [];

// Iceland trip pledges
pledges.push({ id: generateId(), post_id: posts[0].id, user_id: users[0].id, amount: 1000, status: 'authorized' });
pledges.push({ id: generateId(), post_id: posts[0].id, user_id: users[1].id, amount: 1000, status: 'authorized' });
pledges.push({ id: generateId(), post_id: posts[0].id, user_id: users[2].id, amount: 500, status: 'authorized' });

// Workspace equipment pledges
pledges.push({ id: generateId(), post_id: posts[1].id, user_id: users[1].id, amount: 750, status: 'authorized' });
pledges.push({ id: generateId(), post_id: posts[1].id, user_id: users[0].id, amount: 500, status: 'authorized' });
pledges.push({ id: generateId(), post_id: posts[1].id, user_id: users[3].id, amount: 250, status: 'authorized' });

// Garden tools pledges
pledges.push({ id: generateId(), post_id: posts[2].id, user_id: users[2].id, amount: 400, status: 'authorized' });
pledges.push({ id: generateId(), post_id: posts[2].id, user_id: users[3].id, amount: 400, status: 'authorized' });

db.pledges = pledges;

// Write to file
fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

console.log('\n✅ Database seeded successfully!');
console.log(`\n📁 Database file: ${dbPath}`);
console.log('\n📝 Demo accounts:');
console.log('   alice@demo.com / password');
console.log('   bob@demo.com / password');
console.log('   charlie@demo.com / password');
console.log('   diana@demo.com / password');
console.log('\n🚀 Run "npm run dev" to start the application!');
