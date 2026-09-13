import { http } from './http';

export interface ChangePasswordPayload {
  current_password?: string;
  password: string;
  password_confirmation: string;
}

export interface ChangePasswordResponse {
  message: string;
}

export async function changePassword(
  payload: ChangePasswordPayload,
): Promise<ChangePasswordResponse> {
  const response = await http.patch<ChangePasswordResponse>(
    '/auth/password',
    payload,
  );

  return response.data;
}
