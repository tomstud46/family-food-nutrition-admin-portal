export type OrderStatus='pending_payment'|'paid'|'cancelled'|string;
export interface OrderMeal { meal_id:number; scheduled_date:string|null; meal_slot:string; price:number|string; }
export interface Order { id:number; customer_id:number; status:OrderStatus; total_amount:number|string; meals:OrderMeal[]; notes:string|null; created_by:number; paid_by:number|null; paid_at:string|null; cancelled_by:number|null; cancelled_at:string|null; cancellation_reason:string|null; created_at:string; }
export interface Paged<T>{data:T[];meta:{current_page:number;last_page:number;total:number}}
