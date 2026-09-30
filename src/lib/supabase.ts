import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type ItemType = 'lost' | 'found';
export type ItemStatus = 'active' | 'matched' | 'verified' | 'handover' | 'recovered';
export type RecoveryStatus = 'verified' | 'handover' | 'recovered';
export type UserRole = 'user' | 'admin';

export interface Profile {
  id: string;
  full_name: string;
  student_id: string;
  role: UserRole;
  created_at?: string;
}

export interface Item {
  id: string;
  user_id: string;
  type: ItemType;
  title: string;
  category: string | null;
  color: string | null;
  description: string | null;
  distinguishing_features: string | null;
  ai_category: string | null;
  ai_color: string | null;
  ai_features: string[];
  location: string;
  reported_at: string | null;
  created_at: string;
  photo_url: string | null;
  status: ItemStatus;
}

export interface ChallengeQuestion {
  question: string;
  answer: string;
}

export interface OwnershipChallenge {
  id: string;
  found_item_id: string;
  lost_item_id: string | null;
  claimant_id: string;
  questions: ChallengeQuestion[];
  answers: string[];
  correct_count: number;
  total_questions: number;
  verified: boolean;
  created_at: string;
}

export interface Recovery {
  id: string;
  found_item_id: string;
  lost_item_id: string | null;
  claimant_id: string;
  challenge_id: string | null;
  token: string;
  handover_point: string | null;
  status: RecoveryStatus;
  created_at: string;
  updated_at: string;
}

export const HANDOVER_POINTS = [
  'Library Reception',
  'Security Desk',
  'Department Office',
  'Hostel Office',
] as const;

export const CATEGORIES = [
  'Backpack', 'Laptop', 'Phone', 'Wallet', 'Umbrella',
  'Water Bottle', 'Notebook', 'Headphones', 'Earbuds', 'Keys',
  'Glasses', 'Watch', 'Jacket', 'Tablet', 'Camera', 'Calculator',
  'Textbook', 'ID Card', 'Charger', 'Electronics',
  'Clothing', 'Accessory', 'Stationery', 'Other',
] as const;

export const COLORS = [
  'Black', 'White', 'Blue', 'Red', 'Green', 'Yellow', 'Orange',
  'Purple', 'Pink', 'Brown', 'Gray', 'Silver', 'Gold', 'Navy',
  'Teal', 'Beige', 'Multicolor', 'Other',
] as const;
