export type CoachRole = 'user' | 'assistant';

export interface CoachMessage {
  id: string;
  role: CoachRole;
  content: string;
  created_at: string;
}

export interface CoachProfileData {
  onboarding_completed: boolean;
  aspirations?: string;
  lifestyle?: string;
  productivity_patterns?: string;
  blockers?: string;
  ideal_self?: string;
  last_ai_insight?: string;
}

export interface CoachProfile {
  user_id: string;
  data: CoachProfileData;
  updated_at: string;
}
