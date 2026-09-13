import {http} from './http';
import type {Notification,NotificationPage} from '../types/notifications';
const unwrap=<T,>(x:any):T=>x?.data??x;
export async function listNotifications(page=1){return (await http.get<NotificationPage>(`/notifications?page=${page}&per_page=25`)).data}
export async function getUnreadCount(){return unwrap<{unread_count:number}>((await http.get('/notifications/unread-count')).data)}
export async function markNotificationRead(id:string){return unwrap<{notification:Notification}>((await http.post(`/notifications/${encodeURIComponent(id)}/read`)).data)}
export async function markAllNotificationsRead(){return http.post('/notifications/read-all')}
