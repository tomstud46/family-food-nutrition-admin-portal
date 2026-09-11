import {http} from './http';
import type {Delivery} from '../types/delivery';
const unwrap=<T,>(x:any):T=>x?.data??x;
export async function getDelivery(customerId:number,orderId:number){return unwrap<{delivery:Delivery}>((await http.get(`/customers/${customerId}/orders/${orderId}/delivery`)).data)}
export async function createDelivery(customerId:number,orderId:number,payload:any){return http.post(`/customers/${customerId}/orders/${orderId}/delivery`,payload)}
export async function scheduleDelivery(id:number,scheduled_at:string){return http.post(`/deliveries/${id}/schedule`,{scheduled_at})}
export async function assignDelivery(id:number,assigned_to:number){return http.post(`/deliveries/${id}/assign`,{assigned_to})}
export async function dispatchDelivery(id:number){return http.post(`/deliveries/${id}/dispatch`)}
export async function outForDelivery(id:number){return http.post(`/deliveries/${id}/out-for-delivery`)}
export async function deliverDelivery(id:number,delivery_notes?:string){return http.post(`/deliveries/${id}/deliver`,{delivery_notes:delivery_notes||null})}
