import { http } from './http';
import type {
  CustomerAdminResponse,
  CustomerListResponse,
  CustomerResponse,
  CreateCustomerPayload,
  UpdateCustomerPayload,
} from '../types/customer';

export async function listCustomers(page = 1, perPage = 25): Promise<CustomerListResponse> {
  const response = await http.get<CustomerListResponse>('/customers', {
    params: { page, per_page: perPage },
  });
  return response.data;
}

export async function getCustomer(id: number): Promise<CustomerResponse> {
  const response = await http.get<CustomerResponse>(`/customers/${id}`);
  return response.data;
}

export async function createCustomer(
  payload: CreateCustomerPayload,
): Promise<CustomerAdminResponse> {
  const response = await http.post<CustomerAdminResponse>(
    '/customers/admin',
    payload,
  );
  return response.data;
}

export async function updateCustomer(
  id: number,
  payload: UpdateCustomerPayload,
): Promise<CustomerAdminResponse> {
  const response = await http.patch<CustomerAdminResponse>(
    `/customers/${id}/admin`,
    payload,
  );
  return response.data;
}

export async function suspendCustomer(
  id: number,
  reason: string,
): Promise<CustomerAdminResponse> {
  const response = await http.post<CustomerAdminResponse>(
    `/customers/${id}/suspend`,
    { reason },
  );
  return response.data;
}

export async function reactivateCustomer(
  id: number,
): Promise<CustomerAdminResponse> {
  const response = await http.post<CustomerAdminResponse>(
    `/customers/${id}/reactivate`,
  );
  return response.data;
}
