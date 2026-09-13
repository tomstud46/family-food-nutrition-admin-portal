import { http } from './http';
import type { Paged, Order } from '../types/orders';

export async function listOrders(customerId: number, page = 1, perPage = 25) {
  return (
    await http.get<Paged<Order>>(
      `/customers/${customerId}/orders?page=${page}&per_page=${perPage}`
    )
  ).data;
}

export async function getOrder(id: number) {
  return (
    await http.get<{ order: Order }>(`/orders/${id}`)
  ).data;
}

export async function createOrder(
  customerId: number,
  payload: { meal_ids: number[]; notes: string | null }
) {
  return http.post(`/customers/${customerId}/orders`, payload);
}

export async function cancelOrder(
  id: number,
  cancellation_reason: string
) {
  return http.post(`/orders/${id}/cancel`, { cancellation_reason });
}
