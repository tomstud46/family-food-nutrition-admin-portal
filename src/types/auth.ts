export type AdminRole = 'super_admin' | 'nutritionist' | 'kitchen_operations' | 'procurement' | 'logistics';
export interface AuthUser { id:number; name:string; email:string; role?:AdminRole|null; status:'active'|'suspended'|string; created_at?:string; }
export interface LoginResponse { user:AuthUser; token:string; }
