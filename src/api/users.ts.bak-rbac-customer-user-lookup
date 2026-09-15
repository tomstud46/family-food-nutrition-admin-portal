import { http } from './http';
import type {
  AssignRolePayload,
  CreateStaffPayload,
  StaffListResponse,
  StaffResponse,
  UpdateStaffPayload,
} from '../types/user';

export async function listUsers(
  page = 1,
  perPage = 25,
): Promise<StaffListResponse> {
  const response = await http.get<StaffListResponse>('/users', {
    params: {
      page,
      per_page: perPage,
    },
  });

  return response.data;
}

export async function createStaff(
  payload: CreateStaffPayload,
): Promise<StaffResponse> {
  const response = await http.post<StaffResponse>('/users', payload);
  return response.data;
}

export async function updateStaff(
  id: number,
  payload: UpdateStaffPayload,
): Promise<StaffResponse> {
  const response = await http.patch<StaffResponse>(`/users/${id}`, payload);
  return response.data;
}

export async function assignRole(
  id: number,
  payload: AssignRolePayload,
): Promise<StaffResponse> {
  const response = await http.patch<StaffResponse>(
    `/users/${id}/role`,
    payload,
  );

  return response.data;
}

export async function suspendUser(
  id: number,
  reason: string,
): Promise<StaffResponse> {
  const response = await http.post<StaffResponse>(
    `/users/${id}/suspend`,
    { reason },
  );

  return response.data;
}

export async function reactivateUser(
  id: number,
): Promise<StaffResponse> {
  const response = await http.post<StaffResponse>(
    `/users/${id}/reactivate`,
  );

  return response.data;
}
