export type HouseholdStatus = 'pending' | 'active' | 'suspended' | 'inactive' | 'closed';
export interface HouseholdMember { id:number; customer_id:number; role:string; status:'active'|'left'|string; joined_at:string|null; left_at:string|null; }
export interface Household { id:number; name:string|null; primary_customer_id:number; status:HouseholdStatus; shared_budget_limit:string|number|null; preferences:Record<string, unknown>|null; members:HouseholdMember[]; created_at:string; }
export interface HouseholdResponse { household: Household; }
