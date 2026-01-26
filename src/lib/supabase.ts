import { supabase } from "@/integrations/supabase/client";

export { supabase };

// Type helpers for database queries
export type Tool = {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  logo_url: string | null;
  website_url: string | null;
  pricing_model: 'free' | 'freemium' | 'paid' | 'enterprise' | 'open_source' | 'subscription';
  features: unknown; // JSON type from database
  target_users: string[] | null;
  status: 'pending' | 'verified' | 'deprecated' | 'removed';
  ai_score: number;
  community_score: number;
  composite_score: number;
  confidence_score: number;
  mention_count: number;
  question_count: number;
  created_at: string;
  updated_at: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  display_order: number;
};

export type ToolWithCategory = Tool & {
  categories: Category[];
};

export type Question = {
  id: string;
  user_id: string;
  title: string;
  body: string;
  status: 'active' | 'hidden' | 'deleted';
  view_count: number;
  answer_count: number;
  upvotes: number;
  downvotes: number;
  is_answered: boolean;
  created_at: string;
  updated_at: string;
};

export type Answer = {
  id: string;
  question_id: string;
  user_id: string;
  body: string;
  status: 'active' | 'hidden' | 'deleted';
  upvotes: number;
  downvotes: number;
  is_accepted: boolean;
  created_at: string;
  updated_at: string;
};

export type Profile = {
  id: string;
  user_id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  reputation_score: number;
  trust_level: number;
  total_upvotes_received: number;
  total_answers: number;
  total_questions: number;
  is_verified: boolean;
  created_at: string;
};
