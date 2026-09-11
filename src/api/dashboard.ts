import { http } from './http';

export interface DashboardStats {
  active_customers: {
    value: string;
    change: string;
    period: string;
  };
  orders_this_month: {
    value: string;
    change: string;
    period: string;
  };
  revenue: {
    value: string;
    change: string;
    period: string;
  };
  deliveries_today: {
    value: string;
    change: string;
    period: string;
  };
}

export interface NeedsAttentionItem {
  title: string;
  description: string;
  count: number;
}

export interface NeedsAttentionData {
  payment_reviews: NeedsAttentionItem;
  nutrition_reviews: NeedsAttentionItem;
  procurement: NeedsAttentionItem;
}

export interface RecentOrder {
  id: string;
  customer_name: string;
  plan_details: string;
  amount: string;
  payment_status: string;
  order_status: string;
}

export interface DashboardApiResponse {
  stats: DashboardStats;
  needs_attention?: NeedsAttentionData;
  recent_orders: RecentOrder[];
}

export async function getDashboardSummary() {
  return (
    await http.get<DashboardApiResponse>('/dashboard/summary')
  ).data;
}
