export interface User {
  id: string;
  email: string;
  password: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Community {
  id: string;
  name: string;
  description: string | null;
  leader_id: string;
  is_private: number;
  created_at: string;
  updated_at: string;
}

export interface CommunityMember {
  id: string;
  community_id: string;
  user_id: string;
  role: string;
  status: string;
  joined_at: string;
}

export interface Proposal {
  id: string;
  community_id: string;
  user_id: string;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProposalVote {
  id: string;
  proposal_id: string;
  user_id: string;
  vote_type: string;
  created_at: string;
}

export interface Post {
  id: string;
  community_id: string;
  title: string;
  description: string | null;
  goal_amount: number;
  current_amount: number;
  deadline: string;
  image_url: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Pledge {
  id: string;
  post_id: string;
  user_id: string;
  amount: number;
  status: string;
  created_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  parent_comment_id: string | null;
  content: string;
  created_at: string;
  updated_at: string;
}

// Extended types with relations
export interface CommunityWithLeader extends Community {
  leader: User;
  member_count?: number;
}

export interface ProposalWithVotes extends Proposal {
  author: User;
  upvotes: number;
  downvotes: number;
  user_vote?: string | null;
}

export interface PostWithCommunity extends Post {
  community: Community;
  progress: number;
}

export interface CommentWithAuthor extends Comment {
  author: User;
  replies?: CommentWithAuthor[];
}
