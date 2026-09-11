export type DeliveryStatus='pending'|'scheduled'|'assigned'|'dispatched'|'out_for_delivery'|'delivered'|string;
export interface DeliveryAddress {line1:string;line2:string|null;city:string}
export interface Delivery {id:number;order_id:number;status:DeliveryStatus;address:DeliveryAddress;scheduled_at:string|null;assigned_to:number|null;dispatched_at:string|null;delivered_at:string|null;delivery_notes:string|null;created_at:string}
