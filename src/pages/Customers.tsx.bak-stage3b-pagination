import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { AlertCircle, ChevronLeft, ChevronRight, Eye, Search, Users } from 'lucide-react';
import { listCustomers } from '../api/customers';
import type { Customer } from '../types/customer';

function formatDate(value: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(undefined, { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
}

function displayPhone(customer: Customer) {
  return customer.phone?.trim() || 'No phone recorded';
}

export default function Customers() {
  const [params, setParams] = useSearchParams();
  const page = Math.max(Number(params.get('page') || 1), 1);
  const query = params.get('q') || '';
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['customers', page],
    queryFn: () => listCustomers(page),
    placeholderData: (previous) => previous,
  });

  const filtered = (data?.data || []).filter((customer) => {
    const haystack = [customer.id, customer.user_id, customer.phone, customer.city, customer.address_line1]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return haystack.includes(query.toLowerCase());
  });

  const updateQuery = (value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set('q', value); else next.delete('q');
    next.set('page', '1');
    setParams(next);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-500">
            <Users size={16} /> Customer Management
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950">Customers</h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">Browse customer profiles and open their operational record. Administrative access is enforced by Laravel.</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
          <span className="font-semibold text-slate-950">{data?.meta.total ?? '—'}</span> total customers
        </div>
      </header>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 md:flex-row md:items-center md:justify-between">
          <label className="relative block w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
            <input
              value={query}
              onChange={(event) => updateQuery(event.target.value)}
              placeholder="Filter this page by ID, phone or city"
              className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none transition focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-100"
            />
          </label>
          <span className="text-xs text-slate-400">Page {data?.meta.current_page ?? page} of {data?.meta.last_page ?? '—'}</span>
        </div>

        {isLoading ? (
          <div className="divide-y divide-slate-100">
            {Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-16 animate-pulse bg-slate-50/70" />)}
          </div>
        ) : isError ? (
          <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
            <div className="mb-3 rounded-full bg-red-50 p-3 text-red-600"><AlertCircle size={20} /></div>
            <h2 className="font-semibold text-slate-900">Customers could not be loaded</h2>
            <p className="mt-1 max-w-md text-sm text-slate-500">The API request failed. Check the Laravel API connection and authentication, then try again.</p>
            <button onClick={() => refetch()} className="mt-4 rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">Retry</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
            <div className="mb-3 rounded-full bg-slate-100 p-3 text-slate-500"><Users size={20} /></div>
            <h2 className="font-semibold text-slate-900">No customers on this page</h2>
            <p className="mt-1 text-sm text-slate-500">Try clearing the filter or move to another page.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Phone</th>
                  <th className="px-5 py-3">City</th>
                  <th className="px-5 py-3">Date of birth</th>
                  <th className="px-5 py-3">Created</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((customer) => (
                  <tr key={customer.id} className="transition hover:bg-slate-50/80">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600">#{customer.id}</div>
                        <div><div className="font-semibold text-slate-900">Customer #{customer.id}</div><div className="text-xs text-slate-400">User #{customer.user_id}</div></div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-700">{displayPhone(customer)}</td>
                    <td className="px-5 py-4 text-slate-600">{customer.city || '—'}</td>
                    <td className="px-5 py-4 text-slate-600">{formatDate(customer.date_of_birth)}</td>
                    <td className="px-5 py-4 text-slate-600">{formatDate(customer.created_at)}</td>
                    <td className="px-5 py-4 text-right"><Link to={`/customers/${customer.id}`} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:border-slate-300 hover:bg-white"><Eye size={15} /> Open</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
          <span className="text-xs text-slate-500">Showing {filtered.length} of {data?.data.length ?? 0} records on this page</span>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setParams({ page: String(page - 1), ...(query ? { q: query } : {}) })} className="rounded-lg border border-slate-200 p-2 text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft size={16} /></button>
            <button disabled={!data || page >= data.meta.last_page} onClick={() => setParams({ page: String(page + 1), ...(query ? { q: query } : {}) })} className="rounded-lg border border-slate-200 p-2 text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"><ChevronRight size={16} /></button>
          </div>
        </div>
      </section>
    </div>
  );
}
