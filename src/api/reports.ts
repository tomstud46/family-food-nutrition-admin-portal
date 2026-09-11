import { http } from './http';

export type ReportRange = { from?: string; to?: string };

const params = (range: ReportRange) => ({ params: { ...(range.from ? { from: range.from } : {}), ...(range.to ? { to: range.to } : {}) } });

export async function getOverview(range: ReportRange = {}) { return (await http.get('/reports/overview', params(range))).data.data; }
export async function getOrdersReport(range: ReportRange = {}) { return (await http.get('/reports/orders', params(range))).data.data; }
export async function getInventoryReport(range: ReportRange = {}) { return (await http.get('/reports/inventory', params(range))).data.data; }
export async function getOperationsReport(range: ReportRange = {}) { return (await http.get('/reports/operations', params(range))).data.data; }
export async function getSupportReport(range: ReportRange = {}) { return (await http.get('/reports/support', params(range))).data.data; }
