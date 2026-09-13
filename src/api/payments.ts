import {http} from './http';
import type {Paged,Payment} from '../types/payments';
const unwrap=<T,>(x:any):T=>x?.data??x;
export async function listPayments(customerId:number,orderId:number,page=1,perPage=25){return (await http.get<Paged<Payment>>(`/customers/${customerId}/orders/${orderId}/payments?page=${page}&per_page=${perPage}`)).data}
export async function getPayment(id:number){return unwrap<{payment:Payment}>((await http.get(`/payments/${id}`)).data)}
export async function createPayment(customerId:number,orderId:number,payload:{idempotency_key:string;provider:string;payment_method:string}){return http.post(`/customers/${customerId}/orders/${orderId}/payments`,payload)}
export async function createBankTransfer(customerId:number,orderId:number,payload:FormData){return http.post(`/customers/${customerId}/orders/${orderId}/payments/bank-transfer`,payload,{headers:{'Content-Type':'multipart/form-data'}})}
export async function reviewBankTransfer(id:number,decision:'under_review'|'approved'|'rejected',reason:string){return http.post(`/payments/${id}/bank-transfer/review`,{decision,reason})}
