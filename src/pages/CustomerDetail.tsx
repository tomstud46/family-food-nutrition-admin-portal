import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, MapPin, Phone, UserRound } from 'lucide-react';
import {
  getCustomer,
  reactivateCustomer,
  suspendCustomer,
  updateCustomer,
} from '../api/customers';
import { getUser } from '../api/users';
import type { UpdateCustomerPayload } from '../types/customer';
import { useAuthStore } from '../stores/authStore';

function formatDate(value: string | null) {
  if (!value) return 'Not recorded';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat(undefined, { day: '2-digit', month: 'long', year: 'numeric' }).format(date);
}

export default function CustomerDetail() {
  const { id } = useParams();
  const customerId = Number(id);
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const isSuperAdmin = user?.role === 'super_admin';
  const [editing, setEditing] = useState(false);
  const [suspending, setSuspending] = useState(false);
  const [suspensionReason, setSuspensionReason] = useState('');

  const customerQuery = useQuery({
    queryKey: ['customer', customerId],
    queryFn: () => getCustomer(customerId),
    enabled: Number.isInteger(customerId) && customerId > 0,
  });

  const customer = customerQuery.data?.customer;

  const accountQuery = useQuery({
    queryKey: ['user', customer?.user_id],
    queryFn: () => getUser(customer!.user_id),
    enabled: isSuperAdmin && !!customer,
  });

  const [form, setForm] = useState<UpdateCustomerPayload>({});

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateCustomerPayload) =>
      updateCustomer(customerId, payload),
    onSuccess: async () => {
      setEditing(false);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['customer', customerId] }),
        queryClient.invalidateQueries({
          queryKey: ['user', customer?.user_id],
        }),
        queryClient.invalidateQueries({ queryKey: ['customers'] }),
      ]);
    },
  });

  const suspendMutation = useMutation({
    mutationFn: (reason: string) => suspendCustomer(customerId, reason),
    onSuccess: async () => {
      setSuspending(false);
      setSuspensionReason('');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['customer', customerId] }),
        queryClient.invalidateQueries({
          queryKey: ['user', customer?.user_id],
        }),
        queryClient.invalidateQueries({ queryKey: ['customers'] }),
      ]);
    },
  });

  const reactivateMutation = useMutation({
    mutationFn: () => reactivateCustomer(customerId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['customer', customerId] }),
        queryClient.invalidateQueries({
          queryKey: ['user', customer?.user_id],
        }),
        queryClient.invalidateQueries({ queryKey: ['customers'] }),
      ]);
    },
  });

  function startEditing() {
    if (!customer || !accountQuery.data?.user) return;

    setForm({
      name: accountQuery.data.user.name,
      email: accountQuery.data.user.email,
      phone: customer.phone,
      date_of_birth: customer.date_of_birth,
      address_line1: customer.address_line1,
      address_line2: customer.address_line2,
      city: customer.city,
    });
    setEditing(true);
  }

  function submitUpdate(event: FormEvent) {
    event.preventDefault();

    const payload: UpdateCustomerPayload = {
      name: form.name?.trim(),
      email: form.email?.trim(),
      phone: form.phone?.trim() || null,
      date_of_birth: form.date_of_birth || null,
      address_line1: form.address_line1?.trim() || null,
      address_line2: form.address_line2?.trim() || null,
      city: form.city?.trim() || null,
    };

    updateMutation.mutate(payload);
  }

  function submitSuspend(event: FormEvent) {
    event.preventDefault();

    const reason = suspensionReason.trim();
    if (reason.length < 5) return;

    suspendMutation.mutate(reason);
  }

  if (customerQuery.isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-40 animate-pulse rounded bg-slate-200" />
        <div className="h-64 animate-pulse rounded-xl bg-slate-200" />
      </div>
    );
  }

  if (customerQuery.isError || !customer) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8">
        <h1 className="font-semibold text-slate-950">Customer record unavailable</h1>
        <p className="mt-2 text-sm text-slate-500">
          The customer could not be retrieved from the Laravel API.
        </p>
        <Link
          to="/customers"
          className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-800"
        >
          <ArrowLeft size={16} /> Back to customers
        </Link>
      </div>
    );
  }

  const account = accountQuery.data?.user;
  const accountStatus = account?.status;
  const isSuspended = accountStatus === 'suspended';

  return (
    <div className="space-y-6">
      <Link
        to="/customers"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft size={16} /> Customers
      </Link>

      <header className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-950 text-sm font-bold text-white">
              #{customer.id}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Customer profile
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
                {account?.name || `Customer #${customer.id}`}
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Linked authentication account: User #{customer.user_id}
              </p>
            </div>
          </div>

          <div
            className={`rounded-lg px-3 py-2 text-xs font-semibold ${
              isSuspended
                ? 'bg-red-50 text-red-700'
                : 'bg-emerald-50 text-emerald-700'
            }`}
          >
            {isSuspended ? 'Suspended' : 'Active'}
          </div>
        </div>

        {isSuperAdmin && account && (
          <div className="mt-5 grid gap-4 border-t border-slate-100 pt-5 md:grid-cols-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Account name
              </p>
              <p className="mt-1 text-sm font-medium text-slate-950">
                {account.name}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Email
              </p>
              <p className="mt-1 text-sm font-medium text-slate-950">
                {account.email}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Account status
              </p>
              <p className="mt-1 text-sm font-medium text-slate-950">
                {account.status}
              </p>
            </div>
          </div>
        )}

        {isSuperAdmin && (
          <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-5">
            {!editing && (
              <button
                type="button"
                disabled={accountQuery.isLoading || !account}
                onClick={startEditing}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-50"
              >
                Edit
              </button>
            )}

            {!isSuspended && !suspending && (
              <button
                type="button"
                onClick={() => setSuspending(true)}
                className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
              >
                Suspend
              </button>
            )}

            {isSuspended && (
              <button
                type="button"
                disabled={reactivateMutation.isPending}
                onClick={() => reactivateMutation.mutate()}
                className="rounded-lg border border-emerald-200 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
              >
                {reactivateMutation.isPending ? 'Reactivating...' : 'Reactivate'}
              </button>
            )}
          </div>
        )}

        {isSuperAdmin && suspending && (
          <form
            onSubmit={submitSuspend}
            className="mt-4 rounded-lg border border-red-100 bg-red-50 p-4"
          >
            <label className="block text-sm font-semibold text-red-900">
              Suspension reason
              <input
                required
                minLength={5}
                value={suspensionReason}
                onChange={(event) => setSuspensionReason(event.target.value)}
                placeholder="Enter the reason for suspension"
                className="mt-2 h-10 w-full rounded-lg border border-red-200 bg-white px-3 text-sm outline-none focus:border-red-400"
              />
            </label>

            <div className="mt-3 flex gap-2">
              <button
                type="submit"
                disabled={
                  suspendMutation.isPending ||
                  suspensionReason.trim().length < 5
                }
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {suspendMutation.isPending ? 'Suspending...' : 'Confirm suspension'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setSuspending(false);
                  setSuspensionReason('');
                }}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {(updateMutation.isError ||
          suspendMutation.isError ||
          reactivateMutation.isError ||
          accountQuery.isError) && (
          <p className="mt-4 text-sm text-red-600">
            The requested customer account operation could not be completed.
            Check the Laravel API response and try again.
          </p>
        )}
      </header>

      {isSuperAdmin && editing && account && (
        <form
          onSubmit={submitUpdate}
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-slate-950">
            Edit customer
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Update the customer's authentication account and profile.
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="text-sm font-medium text-slate-700">
              Name
              <input
                required
                value={form.name || ''}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
                className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 outline-none focus:border-slate-400"
              />
            </label>

            <label className="text-sm font-medium text-slate-700">
              Email
              <input
                required
                type="email"
                value={form.email || ''}
                onChange={(event) =>
                  setForm({ ...form, email: event.target.value })
                }
                className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 outline-none focus:border-slate-400"
              />
            </label>

            <label className="text-sm font-medium text-slate-700">
              Phone
              <input
                value={form.phone || ''}
                onChange={(event) =>
                  setForm({ ...form, phone: event.target.value })
                }
                className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 outline-none focus:border-slate-400"
              />
            </label>

            <label className="text-sm font-medium text-slate-700">
              Date of birth
              <input
                type="date"
                value={form.date_of_birth || ''}
                onChange={(event) =>
                  setForm({ ...form, date_of_birth: event.target.value })
                }
                className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 outline-none focus:border-slate-400"
              />
            </label>

            <label className="text-sm font-medium text-slate-700 md:col-span-2">
              Address line 1
              <input
                value={form.address_line1 || ''}
                onChange={(event) =>
                  setForm({ ...form, address_line1: event.target.value })
                }
                className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 outline-none focus:border-slate-400"
              />
            </label>

            <label className="text-sm font-medium text-slate-700">
              Address line 2
              <input
                value={form.address_line2 || ''}
                onChange={(event) =>
                  setForm({ ...form, address_line2: event.target.value })
                }
                className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 outline-none focus:border-slate-400"
              />
            </label>

            <label className="text-sm font-medium text-slate-700">
              City
              <input
                value={form.city || ''}
                onChange={(event) =>
                  setForm({ ...form, city: event.target.value })
                }
                className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 outline-none focus:border-slate-400"
              />
            </label>
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {updateMutation.isPending ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </form>
      )}

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Phone size={17}/> Contact
          </div>
          <p className="text-sm text-slate-600">Phone</p>
          <p className="mt-1 font-medium text-slate-950">
            {customer.phone || 'Not recorded'}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900">
            <CalendarDays size={17}/> Personal information
          </div>
          <p className="text-sm text-slate-600">Date of birth</p>
          <p className="mt-1 font-medium text-slate-950">
            {formatDate(customer.date_of_birth)}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:col-span-2">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900">
            <MapPin size={17}/> Address
          </div>
          <p className="font-medium text-slate-950">
            {customer.address_line1 || 'Address not recorded'}
          </p>
          {customer.address_line2 && (
            <p className="mt-1 text-sm text-slate-600">
              {customer.address_line2}
            </p>
          )}
          <p className="mt-1 text-sm text-slate-600">
            {customer.city || 'City not recorded'}
          </p>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-slate-50 p-5">
        <div className="flex items-start gap-3">
          <UserRound className="mt-0.5 text-slate-500" size={18}/>
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Operational record
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              This view currently reflects the fields exposed by the Laravel
              CustomerResource. Nutrition, household, orders, payments and
              delivery records will be connected through their respective API
              domains.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
