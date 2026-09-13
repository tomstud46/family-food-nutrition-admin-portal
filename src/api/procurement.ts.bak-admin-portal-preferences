import {http} from './http';
import type {Paged,PurchaseOrder,Supplier} from '../types/procurement';
const unwrap=<T,>(x:any):T=>x?.data??x;
export async function listSuppliers(page=1){return (await http.get<Paged<Supplier>>(`/suppliers?page=${page}&per_page=25`)).data}
export async function getSupplier(id:number){return unwrap<{supplier:Supplier}>((await http.get(`/suppliers/${id}`)).data)}
export async function createSupplier(payload:any){return http.post('/suppliers',payload)}
export async function updateSupplier(id:number,payload:any){return http.patch(`/suppliers/${id}`,payload)}
export async function listPurchaseOrders(page=1){return (await http.get<Paged<PurchaseOrder>>(`/purchase-orders?page=${page}&per_page=25`)).data}
export async function getPurchaseOrder(id:number){return unwrap<{purchase_order:PurchaseOrder}>((await http.get(`/purchase-orders/${id}`)).data)}
export async function createPurchaseOrder(payload:any){return http.post('/purchase-orders',payload)}
export async function updatePurchaseOrder(id:number,payload:any){return http.patch(`/purchase-orders/${id}`,payload)}
export async function submitPurchaseOrder(id:number){return http.post(`/purchase-orders/${id}/submit`)}
export async function approvePurchaseOrder(id:number){return http.post(`/purchase-orders/${id}/approve`)}
export async function rejectPurchaseOrder(id:number,reason:string){return http.post(`/purchase-orders/${id}/reject`,{rejection_reason:reason})}
export async function receivePurchaseOrder(id:number){return http.post(`/purchase-orders/${id}/receive`)}
export async function cancelPurchaseOrder(id:number,reason:string){return http.post(`/purchase-orders/${id}/cancel`,{cancellation_reason:reason})}
