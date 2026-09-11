import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, MapPin, Phone, UserRound } from 'lucide-react';
import { getCustomer } from '../api/customers';

function formatDate(value: string | null) {
  if (!value) return 'Not recorded';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat(undefined, { day: '2-digit', month: 'long', year: 'numeric' }).format(date);
}

export default function CustomerDetail() {
  const { id } = useParams();
  const customerId = Number(id);
  const { data, isLoading, isError } = useQuery({ queryKey: ['customer', customerId], queryFn: () => getCustomer(customerId), enabled: Number.isInteger(customerId) && customerId > 0 });
  const customer = data?.customer;

  if (isLoading) return <div className="space-y-4"><div className="h-8 w-40 animate-pulse rounded bg-slate-200" /><div className="h-64 animate-pulse rounded-xl bg-slate-200" /></div>;
  if (isError || !customer) return <div className="rounded-xl border border-slate-200 bg-white p-8"><h1 className="font-semibold text-slate-950">Customer record unavailable</h1><p className="mt-2 text-sm text-slate-500">The customer could not be retrieved from the Laravel API.</p><Link to="/customers" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-800"><ArrowLeft size={16}/> Back to customers</Link></div>;

  return <div className="space-y-6">
    <Link to="/customers" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900"><ArrowLeft size={16}/> Customers</Link>
    <header className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4"><div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-950 text-sm font-bold text-white">#{customer.id}</div><div><p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Customer profile</p><h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">Customer #{customer.id}</h1><p className="mt-1 text-sm text-slate-500">Linked authentication account: User #{customer.user_id}</p></div></div>
        <div className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">Profile record</div>
      </div>
    </header>
    <section className="grid gap-4 md:grid-cols-2">
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900"><Phone size={17}/> Contact</div><p className="text-sm text-slate-600">Phone</p><p className="mt-1 font-medium text-slate-950">{customer.phone || 'Not recorded'}</p></div>
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900"><CalendarDays size={17}/> Personal information</div><p className="text-sm text-slate-600">Date of birth</p><p className="mt-1 font-medium text-slate-950">{formatDate(customer.date_of_birth)}</p></div>
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:col-span-2"><div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900"><MapPin size={17}/> Address</div><p className="font-medium text-slate-950">{customer.address_line1 || 'Address not recorded'}</p>{customer.address_line2 && <p className="mt-1 text-sm text-slate-600">{customer.address_line2}</p>}<p className="mt-1 text-sm text-slate-600">{customer.city || 'City not recorded'}</p></div>
    </section>
    <section className="rounded-xl border border-slate-200 bg-slate-50 p-5"><div className="flex items-start gap-3"><UserRound className="mt-0.5 text-slate-500" size={18}/><div><h2 className="text-sm font-semibold text-slate-900">Operational record</h2><p className="mt-1 text-sm leading-6 text-slate-500">This view currently reflects the fields exposed by the Laravel CustomerResource. Nutrition, household, orders, payments and delivery records will be connected through their respective API domains.</p></div></div></section>
  </div>;
}
