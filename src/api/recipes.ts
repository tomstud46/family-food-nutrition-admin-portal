import { http } from './http';
import type { IngredientOption, Meal, Paged, Recipe } from '../types/recipes';
const unwrap=<T,>(x:any):T=>x?.data??x;
export async function listRecipes(page=1,perPage=25){return (await http.get<Paged<Recipe>>(`/recipes?page=${page}&per_page=${perPage}`)).data}
export async function getRecipe(id:number){return unwrap<{recipe:Recipe}>((await http.get(`/recipes/${id}`)).data)}
export async function createRecipe(payload:any){return http.post('/recipes',payload)}
export async function updateRecipe(id:number,payload:any){return http.patch(`/recipes/${id}`,payload)}
export async function submitRecipe(id:number){return http.post(`/recipes/${id}/submit`)}
export async function approveRecipe(id:number){return http.post(`/recipes/${id}/approve`)}
export async function rejectRecipe(id:number,reason:string){return http.post(`/recipes/${id}/reject`,{rejection_reason:reason})}
export async function listIngredients(){return (await http.get<Paged<IngredientOption>>('/ingredients?per_page=100')).data}
export async function listMeals(customerId:number,page=1,perPage=25){return (await http.get<Paged<Meal>>(`/customers/${customerId}/meals?page=${page}&per_page=${perPage}`)).data}
export async function createMeal(customerId:number,payload:any){return http.post(`/customers/${customerId}/meals`,payload)}
export async function cancelMeal(id:number){return http.post(`/meals/${id}/cancel`)}
