import { http } from './http';
import type { Ingredient, InventoryMovement, Paged } from '../types/inventory';
const unwrap=<T,>(x:any):T=>x?.data??x;
export async function listIngredients(page=1,perPage=25){return (await http.get<Paged<Ingredient>>(`/ingredients?page=${page}&per_page=${perPage}`)).data}
export async function getIngredient(id:number){return unwrap<{ingredient:Ingredient}>((await http.get(`/ingredients/${id}`)).data)}
export async function listMovements(id:number,page=1){return (await http.get<Paged<InventoryMovement>>(`/ingredients/${id}/inventory-movements?page=${page}&per_page=25`)).data}
export async function createMovement(id:number,payload:{movement_type:string;quantity_delta:number;reason?:string}){return http.post(`/ingredients/${id}/inventory-movements`,payload)}
export async function createIngredient(payload:any){return http.post('/ingredients',payload)}
export async function updateIngredient(id:number,payload:any){return http.patch(`/ingredients/${id}`,payload)}
export async function approveIngredient(id:number){return http.post(`/ingredients/${id}/approve`)}
export async function rejectIngredient(id:number,reason:string){return http.post(`/ingredients/${id}/reject`,{rejection_reason:reason})}
