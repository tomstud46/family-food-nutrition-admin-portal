export type Period = { from: string | null; to: string | null };
export type StatusRow = { status: string; count: number; amount?: number };
export type Overview = { period: Period; customers: { total: number }; orders: { total: number; paid: number; pending_payment: number; cancelled: number; gross_order_value: number }; payments: { successful_count: number; successful_amount: number; failed_count: number }; deliveries: { total: number; delivered: number; in_progress: number }; support: { total: number; open: number; in_progress: number; resolved: number; closed: number }; inventory: { ingredient_count: number; low_or_empty_count: number; total_quantity_on_hand: number } };
export type OrdersReport = { period: Period; by_status: StatusRow[]; total_orders: number; total_value: number };
export type InventoryReport = { period: Period; current: { ingredient_count: number; total_quantity_on_hand: number; empty_count: number }; movements: { movement_type: string; count: number; quantity: number }[] };
export type OperationsReport = { period: Period; kitchen: Record<string, number>; procurement: Record<string, number>; delivery: Record<string, number> };
export type SupportReport = { period: Period; total: number; by_status: { status: string; count: number }[] };
