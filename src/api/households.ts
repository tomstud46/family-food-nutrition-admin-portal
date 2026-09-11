import { http } from './http';
import type { HouseholdResponse, HouseholdStatus } from '../types/household';

export async function getHousehold(id:number){
  const { data } = await http.get<HouseholdResponse>(`/households/${id}`);
  return data.household;
}

export async function updateHousehold(id:number, payload:{name?:string|null; shared_budget_limit?:number|null; preferences?:Record<string, unknown>|null}){
  const { data } = await http.patch<HouseholdResponse>(`/households/${id}`, payload);
  return data.household;
}

export async function updateHouseholdStatus(id:number, status:HouseholdStatus){
  const { data } = await http.patch<HouseholdResponse>(`/households/${id}/status`, { status });
  return data.household;
}

export async function addHouseholdMember(id:number, email:string){
  const { data } = await http.post<HouseholdResponse>(`/households/${id}/members`, { email });
  return data.household;
}

export async function removeHouseholdMember(id:number, memberId:number){
  const { data } = await http.delete<HouseholdResponse>(`/households/${id}/members/${memberId}`);
  return data.household;
}
