export type SupportTicketStatus =
  | 'open'
  | 'in_progress'
  | 'resolved'
  | 'closed'
  | string;

export interface SupportTicketMessage {
  id: number;
  user_id: number;
  message: string;
  created_at: string;
}

export interface SupportTicket {
  id: number;
  customer_id: number;
  assigned_to: number | null;
  subject: string;
  description: string;
  status: SupportTicketStatus;
  resolved_at: string | null;
  closed_at: string | null;
  messages: SupportTicketMessage[];
  created_at: string;
  updated_at: string;
}

export interface SupportTicketPage {
  data: SupportTicket[];
  meta: {
    current_page: number;
    last_page: number;
    total: number;
  };
}

export interface SupportTicketResponse {
  ticket: SupportTicket;
}
