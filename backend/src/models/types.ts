export type UserRole = 'student' | 'faculty' | 'alumni' | 'admin';

export interface UserRow {
  id: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  department?: string;
  graduation_year?: number;
  company?: string;
  position?: string;
  linkedin_profile?: string;
  mentorship_available: boolean;
  contact_info_visible: boolean;
  is_email_verified: boolean;
  is_suspended: boolean;
  suspension_reason?: string;
  suspension_end?: Date | null;
}
