export interface Session {
  id: number;
  name: string;
  current: boolean;
  created_at: string;
  last_used_at: string | null;
  expires_at: string | null;
}
