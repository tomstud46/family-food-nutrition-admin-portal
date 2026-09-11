export interface Notification { id:string; type:string; title:string|null; message:string|null; data:Record<string,unknown>; read_at:string|null; created_at:string; }
export interface NotificationPage { data:Notification[]; meta:{current_page:number;last_page:number;total:number;unread_count:number}; }
