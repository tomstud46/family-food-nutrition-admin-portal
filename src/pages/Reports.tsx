import { useMemo, useState } from 'react';
import { useQueries } from '@tanstack/react-query';
import { BarChart3, CalendarDays, Download, RefreshCw, ShieldCheck } from 'lucide-react';
import { getInventoryReport, getOperationsReport, getOrdersReport, getOverview, getSupportReport } from '../api/reports';
import type { Overview, OrdersReport, InventoryReport, OperationsReport, SupportReport } from '../types/reports';

const money=(v:number)=>`${Number(v||0).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})} ETB`;
const errorText=(e:any)=>e?.response?.data?.message||Object.values(e?.response?.data?.errors||{})?.flat?.()?.[0]||'The report could not be loaded.';
const label=(s:string)=>s.replaceAll('_',' ');

export default function Reports(){
 const today=new Date(); const prior=new Date(); prior.setDate(today.getDate()-29);
 const iso=(d:Date)=>d.toISOString().slice(0,10);
 const [from,setFrom]=useState(iso(prior)); const [to,setTo]=useState(iso(today));
 const range=useMemo(()=>({from,to}),[from,to]);
 const results=useQueries({queries:[
  {queryKey:['reports','overview',range],queryFn:()=>getOverview(range)},
  {queryKey:['reports','orders',range],queryFn:()=>getOrdersReport(range)},
  {queryKey:['reports','inventory',range],queryFn:()=>getInventoryReport(range)},
  {queryKey:['reports','operations',range],queryFn:()=>getOperationsReport(range)},
  {queryKey:['reports','support',range],queryFn:()=>getSupportReport(range)},
 ]});
 const [overview,orders,inventory,operations,support]=results.map(r=>r.data) as [Overview|undefined,OrdersReport|undefined,InventoryReport|undefined,OperationsReport|undefined,SupportReport|undefined];
 const loading=results.some(r=>r.isLoading); const failed=results.find(r=>r.isError); const refreshing=results.some(r=>r.isFetching);
 const refresh=()=>results.forEach(r=>r.refetch());
 const apply=()=>results.forEach(r=>r.refetch());
 return <div className="space-y-6">
  <header><div className="mb-2 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[.14em] text-slate-600"><ShieldCheck size={13}/> Management reporting</div><div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between"><div><h1 className="text-2xl font-semibold tracking-tight text-slate-950">Reports & Analytics</h1><p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">Read-only operational reporting from Laravel. All figures are calculated by the authoritative reporting service.</p></div><button onClick={refresh} disabled={refreshing} className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 disabled:opacity-50"><RefreshCw size={14} className={refreshing?'animate-spin':''}/>Refresh</button></div></header>
  <section className="rounded-2xl border border-slate-200 bg-white p-4"><div className="flex flex-col gap-3 lg:flex-row lg:items-end"><label className="text-xs font-semibold text-slate-600">From<input type="date" value={from} max={to} onChange={e=>setFrom(e.target.value)} className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"/></label><label className="text-xs font-semibold text-slate-600">To<input type="date" value={to} min={from} onChange={e=>setTo(e.target.value)} className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"/></label><button onClick={apply} disabled={!from||!to||from>to} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-xs font-semibold text-white disabled:opacity-40"><CalendarDays size={14}/>Apply period</button><span className="text-xs text-slate-400 lg:ml-auto">Showing {from} → {to}</span></div></section>
  {loading?<Loading/>:failed?<Error message={errorText(failed.error)}/>:<>
   <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[
    ['Customers',overview?.customers.total,'count'],['Orders',overview?.orders.total,'count'],['Paid orders',overview?.orders.paid,'count'],['Gross order value',overview?.orders.gross_order_value,'money'],['Successful payments',overview?.payments.successful_amount,'money'],['Delivered',overview?.deliveries.delivered,'count'],['Open support',overview?.support.open,'count'],['Low / empty ingredients',overview?.inventory.low_or_empty_count,'count']
   ].map(([name,value,type])=><Metric key={String(name)} label={String(name)} value={type==='money'?money(Number(value)):Number(value||0).toLocaleString()}/>)}</section>
   <div className="grid gap-6 xl:grid-cols-2"><ReportPanel title="Orders by status"><Bars rows={(orders?.by_status||[]).map(x=>({label:x.status,value:x.count,sub:money(x.amount||0)}))}/><Summary left={`Total ${orders?.total_orders||0}`} right={money(orders?.total_value||0)}/></ReportPanel><ReportPanel title="Inventory movements"><Bars rows={(inventory?.movements||[]).map(x=>({label:x.movement_type,value:x.count,sub:`Qty ${x.quantity}`}))}/><Summary left={`${inventory?.current.ingredient_count||0} ingredients`} right={`${inventory?.current.total_quantity_on_hand||0} units on hand`}/></ReportPanel><ReportPanel title="Kitchen operations"><Bars rows={['queued','in_progress','completed','failed'].map(k=>({label:k,value:operations?.kitchen?.[k]||0}))}/></ReportPanel><ReportPanel title="Procurement"><Bars rows={['draft','pending_approval','approved','received','cancelled'].map(k=>({label:k,value:operations?.procurement?.[k]||0}))}/><Summary left="Approved + received spend" right={money(operations?.procurement?.total_cost||0)}/></ReportPanel><ReportPanel title="Deliveries"><Bars rows={['pending','scheduled','assigned','dispatched','out_for_delivery','delivered'].map(k=>({label:k,value:operations?.delivery?.[k]||0}))}/></ReportPanel><ReportPanel title="Support tickets"><Bars rows={(support?.by_status||[]).map(x=>({label:x.status,value:x.count}))}/><Summary left={`Total ${support?.total||0}`} right="Read-only"/></ReportPanel></div>
   <div className="rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-500"><BarChart3 size={15} className="mr-2 inline text-slate-400"/>Reports are read-only. Date filters are sent to Laravel as <code className="rounded bg-slate-100 px-1">from</code> and <code className="rounded bg-slate-100 px-1">to</code>; Super Admin authorization remains enforced by the API.</div>
  </>}
 </div>
}
function Metric({label,value}:{label:string;value:string}){return <div className="rounded-2xl border border-slate-200 bg-white p-5"><div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</div><div className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{value}</div></div>}
function ReportPanel({title,children}:{title:string;children:any}){return <section className="rounded-2xl border border-slate-200 bg-white p-5"><h2 className="text-sm font-semibold text-slate-900">{title}</h2><div className="mt-5">{children}</div></section>}
function Bars({rows}:{rows:{label:string;value:number;sub?:string}[]}){const max=Math.max(1,...rows.map(r=>r.value));return <div className="space-y-3">{rows.map(r=><div key={r.label}><div className="mb-1 flex items-center justify-between gap-3 text-xs"><span className="capitalize text-slate-600">{label(r.label)}</span><span className="font-semibold text-slate-800">{r.value.toLocaleString()}</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-slate-700" style={{width:`${Math.max(r.value/max*100,r.value?3:0)}%`}}/></div>{r.sub&&<div className="mt-1 text-[10px] text-slate-400">{r.sub}</div>}</div>)}</div>}
function Summary({left,right}:{left:string;right:string}){return <div className="mt-5 flex justify-between border-t border-slate-100 pt-4 text-xs"><span className="text-slate-500">{left}</span><span className="font-semibold text-slate-800">{right}</span></div>}
function Loading(){return <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-400">Loading reports…</div>}
function Error({message}:{message:string}){return <div className="rounded-2xl border border-rose-100 bg-rose-50 p-10 text-center text-sm text-rose-700">{message}<div className="mt-2 text-xs text-rose-500">Check the selected date range and your Super Admin access.</div></div>}
