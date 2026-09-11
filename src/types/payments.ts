export type PaymentStatus='pending'|'processing'|'succeeded'|'failed'|'cancelled'|'submitted'|'under_review'|string;
export interface BankTransfer {bank_name:string|null;account_name:string|null;account_number:string|null;transfer_reference:string|null;transfer_date:string|null;proof_submitted:boolean;submitted_at:string|null;reviewed_at:string|null;review_reason:string|null;}
export interface Payment {id:number;order_id:number;status:PaymentStatus;amount:number|string;currency:string;provider:string;payment_method:string;checkout_url:string|null;provider_transaction_id:string|null;bank_transfer:BankTransfer|null;processed_at:string|null;failure_reason:string|null;created_at:string;}
export interface Paged<T>{data:T[];meta:{current_page:number;last_page:number;total:number}}
