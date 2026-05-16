export type CoachRole = 'user' | 'assistant';

export interface CoachAction {
  type: 'create_habit' | 'create_task';
  payload: any;
  label: string;
}

export interface CoachMessage {
  id: string;
  role: CoachRole;
  content: string;
  created_at: string;
  actions?: CoachAction[];
}

export interface CoachProfileData {
  onboarding_completed: boolean;
  goals?: string;
  improvement?: string;
  blockers?: string;
  productivity?: string;
  habits?: string;
  ideal_self?: string;
  last_ai_insight?: string;
}

export interface CoachProfile {
  user_id: string;
  data: CoachProfileData;
  updated_at: string;
}
