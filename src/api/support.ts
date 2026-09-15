import { http } from './http';
import type {
  CreateSupportTicketPayload,
  SupportCustomerOption,
  SupportTicket,
  SupportTicketPage,
  SupportTicketResponse,
} from '../types/support';

export async function listSupportTickets(
  page = 1,
  perPage = 25,
): Promise<SupportTicketPage> {
  const response = await http.get<SupportTicketPage>(
    `/support/tickets?page=${page}&per_page=${perPage}`,
  );

  return response.data;
}

export async function getSupportTicket(
  id: number,
): Promise<SupportTicket> {
  const response = await http.get<SupportTicketResponse>(
    `/support/tickets/${id}`,
  );

  return response.data.ticket;
}

export async function replyToSupportTicket(
  id: number,
  message: string,
): Promise<SupportTicket> {
  const response = await http.post<SupportTicketResponse>(
    `/support/tickets/${id}/reply`,
    { message },
  );

  return response.data.ticket;
}

export async function updateSupportTicketStatus(
  id: number,
  status: 'open' | 'in_progress' | 'resolved' | 'closed',
): Promise<SupportTicket> {
  const response = await http.patch<SupportTicketResponse>(
    `/support/tickets/${id}/status`,
    { status },
  );

  return response.data.ticket;
}

export async function searchSupportCustomers(
  search: string,
): Promise<SupportCustomerOption[]> {
  const response = await http.get<{data: SupportCustomerOption[]}>(
    `/support/tickets/customers?search=${encodeURIComponent(search.trim())}`,
  );

  return response.data.data;
}

export async function createSupportTicket(
  payload: CreateSupportTicketPayload,
): Promise<SupportTicket> {
  const response = await http.post<SupportTicketResponse>(
    '/support/tickets',
    payload,
  );

  return response.data.ticket;
}
