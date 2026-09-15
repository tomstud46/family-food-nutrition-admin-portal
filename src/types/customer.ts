export type Customer = {
  id: number;
  user_id: number;
  phone: string | null;
  date_of_birth: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  created_at: string | null;
};

export type CustomerAccount = {
  id: number;
  name: string;
  email: string;
  role?: string | null;
  status: 'active' | 'suspended' | string;
  created_at?: string;
};

export type CustomerListResponse = {
  data: Customer[];
  meta: {
    current_page: number;
    last_page: number;
    total: number;
  };
};

export type CustomerResponse = {
  customer: Customer;
};

export type CreateCustomerPayload = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone?: string;
  date_of_birth?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
};

export type UpdateCustomerPayload = {
  name?: string;
  email?: string;
  phone?: string | null;
  date_of_birth?: string | null;
  address_line1?: string | null;
  address_line2?: string | null;
  city?: string | null;
};

export type CustomerAdminResponse = {
  customer: Customer;
  user: CustomerAccount;
};
