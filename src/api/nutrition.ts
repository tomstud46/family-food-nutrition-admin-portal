import { http } from './http';
import type { CustomerAllergy, CustomerRestriction, HealthAssessment, NutritionGoal, NutritionPlan, NutritionPlanRequest, NutritionProfile } from '../types/nutrition';

type ApiEnvelope<T> = { data: T };
const data = <T,>(value: ApiEnvelope<T>|T): T => (value as ApiEnvelope<T>).data ?? value as T;

export async function getNutritionProfile(customerId:number){ return data<NutritionProfile|null>((await http.get(`/customers/${customerId}/nutrition-profile`)).data); }
export async function getAssessments(customerId:number){ return data<HealthAssessment[]>((await http.get(`/customers/${customerId}/health-assessments`)).data); }
export async function getGoals(customerId:number){ return data<NutritionGoal[]>((await http.get(`/customers/${customerId}/goals`)).data); }
export async function getPlanRequests(customerId:number){ return data<NutritionPlanRequest[]>((await http.get(`/customers/${customerId}/plan-requests`)).data); }
export async function getPlans(customerId:number){ return data<NutritionPlan[]>((await http.get(`/customers/${customerId}/plans`)).data); }
export async function getAllergies(customerId:number){ return data<CustomerAllergy[]>((await http.get(`/customers/${customerId}/allergies`)).data); }
export async function getRestrictions(customerId:number){ return data<CustomerRestriction[]>((await http.get(`/customers/${customerId}/restrictions`)).data); }
export async function approveAllergy(id:number){ return http.post(`/allergies/${id}/approve`); }
export async function rejectAllergy(id:number, reason:string){ return http.post(`/allergies/${id}/reject`, { rejection_reason: reason }); }
export async function approveRestriction(id:number){ return http.post(`/restrictions/${id}/approve`); }
export async function rejectRestriction(id:number, reason:string){ return http.post(`/restrictions/${id}/reject`, { rejection_reason: reason }); }
export async function submitPlan(id:number){ return http.post(`/plans/${id}/submit`); }
export async function approvePlan(id:number){ return http.post(`/plans/${id}/approve`); }
export async function rejectPlan(id:number, reason:string){ return http.post(`/plans/${id}/reject`, { rejection_reason: reason }); }
