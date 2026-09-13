import { http } from './http';
import type { CustomerListResponse, CustomerResponse } from '../types/customer';

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
