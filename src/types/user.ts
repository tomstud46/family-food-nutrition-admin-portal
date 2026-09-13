import type { AdminRole } from './auth';

export interface StaffUser {
  id: number;
  name: string;
  email: string;
  role?: AdminRole | null;
  status: 'active' | 'suspended' | string;
  created_at?: string;
}

export interface StaffListResponse {
  data: StaffUser[];
  meta: {
    current_page: number;
    last_page: number;
    total: number;
  };
}

export interface StaffResponse {
  user: StaffUser;
}

export interface CreateStaffPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role_slug: Exclude<AdminRole, 'super_admin'>;
}

export interface UpdateStaffPayload {
  name?: string;
  email?: string;
}

export interface AssignRolePayload {
  role_slug: Exclude<AdminRole, 'super_admin'>;
}
