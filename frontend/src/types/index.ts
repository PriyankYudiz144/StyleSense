export type SubscriptionTier = 'trial' | 'starter' | 'pro' | 'enterprise';
export type UserRole = 'super_admin' | 'salon_admin' | 'barber';
export type SessionStatus = 'in_progress' | 'completed' | 'abandoned';

export interface Salon {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  logo_url: string | null;
  subscription_tier: SubscriptionTier;
  ai_credits_remaining: number;
  ai_credits_reset_at: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  salon_id: string | null;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  salon_id: string;
  full_name: string | null;
  phone: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Hairstyle {
  id: string;
  session_id: string;
  preview_url: string;
  style_name: string;
  style_tags: string[];
  ai_metadata: Record<string, unknown>;
  is_selected: boolean;
  created_at: string;
}

export interface Session {
  id: string;
  salon_id: string;
  barber_id: string;
  customer_id: string | null;
  original_photo_url: string;
  face_analysis: Record<string, unknown> | null;
  status: SessionStatus;
  selected_hairstyle_id: string | null;
  final_result_photo_url: string | null;
  hairstyles?: Hairstyle[];
  created_at: string;
  updated_at: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}
