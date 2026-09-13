import {useEffect, useMemo, useState} from 'react';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MessageSquare,
  RefreshCw,
  Send,
  Ticket,
  UserRound,
  XCircle,
} from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { listSupportTickets, replyToSupportTicket, updateSupportTicketStatus } from '../api/support';
import type { SupportTicketStatus } from '../types/support';
import { useAuthStore } from '../stores/authStore';
import {useAdminPortalPreferencesStore} from '../stores/adminPortalPreferencesStore';

const errorText = (e: any) =>
  e?.response?.data?.message ||
  e?.response?.data?.error ||
  Object.values(e?.response?.data?.errors || {})?.flat?.()?.[0] ||
  'The request could not be completed.';

const statusOptions: Array<{
  value: SupportTicketStatus;
  label: string;
}> = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
];

function statusClasses(status: string) {
  switch (status) {
    case 'open':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'in_progress':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'resolved':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'closed':
      return 'bg-slate-100 text-slate-600 border-slate-200';
    default:
      return 'bg-slate-100 text-slate-600 border-slate-200';
  }
}

function formatStatus(status: string) {
  return status.replaceAll('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDate(value: string | null) {
  if (!value) return '—';

  return new Date(value).toLocaleString([], {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export default function Support() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  const [page, setPage] = useState(1);
const pageSize = useAdminPortalPreferencesStore(
  (state) => state.preferences?.page_size ?? 25,
);

useEffect(() => {
  setPage(1);
}, [pageSize]);
  const [filter, setFilter] = useState<'all' | SupportTicketStatus>('all');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [reply, setReply] = useState('');
  const [error, setError] = useState('');

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['support-tickets', page, pageSize],
    queryFn: () => listSupportTickets(page, pageSize),
  });

  const tickets = data?.data ?? [];

  const filteredTickets = useMemo(() => {
    if (filter === 'all') return tickets;
    return tickets.filter((ticket) => ticket.status === filter);
  }, [tickets, filter]);

  const selectedTicket =
    tickets.find((ticket) => ticket.id === selectedId) ??
    filteredTickets[0] ??
    null;

  const canManageStatus =
    user?.role === 'super_admin' ||
    user?.role === 'nutritionist' ||
    user?.role === 'kitchen_operations' ||
    user?.role === 'procurement' ||
    user?.role === 'logistics';

  const canReply = canManageStatus;

  const replyMutation = useMutation({
    mutationFn: () => {
      if (!selectedTicket) {
        throw new Error('Select a ticket first.');
      }

      return replyToSupportTicket(selectedTicket.id, reply.trim());
    },
    onSuccess: (updatedTicket) => {
      setReply('');
      setError('');
      queryClient.setQueryData(
        ['support-tickets', page],
        (old: any) => {
          if (!old) return old;

          return {
            ...old,
            data: old.data.map((ticket: any) =>
              ticket.id === updatedTicket.id ? updatedTicket : ticket,
            ),
          };
        },
      );
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
    },
    onError: (e) => setError(errorText(e)),
  });

  const statusMutation = useMutation({
    mutationFn: (status: 'open' | 'in_progress' | 'resolved' | 'closed') => {
      if (!selectedTicket) {
        throw new Error('Select a ticket first.');
      }

      return updateSupportTicketStatus(selectedTicket.id, status);
    },
    onSuccess: (updatedTicket) => {
      setError('');
      queryClient.setQueryData(
        ['support-tickets', page],
        (old: any) => {
          if (!old) return old;

          return {
            ...old,
            data: old.data.map((ticket: any) =>
              ticket.id === updatedTicket.id ? updatedTicket : ticket,
            ),
          };
        },
      );
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
    },
    onError: (e) => setError(errorText(e)),
  });

  const submitReply = () => {
    if (!reply.trim()) {
      setError('Please enter a message.');
      return;
    }

    if (reply.trim().length > 10000) {
      setError('The message must be 10,000 characters or fewer.');
      return;
    }

    setError('');
    replyMutation.mutate();
  };

  const counts = {
    open: tickets.filter((ticket) => ticket.status === 'open').length,
    in_progress: tickets.filter((ticket) => ticket.status === 'in_progress').length,
    resolved: tickets.filter((ticket) => ticket.status === 'resolved').length,
    closed: tickets.filter((ticket) => ticket.status === 'closed').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
            <MessageSquare className="h-3.5 w-3.5" />
            Customer support
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Support
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage customer tickets and support conversations.
          </p>
        </div>

        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <button
          type="button"
          onClick={() => setFilter('open')}
          className="rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm hover:border-blue-300"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Open</span>
            <Ticket className="h-5 w-5 text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{counts.open}</div>
        </button>

        <button
          type="button"
          onClick={() => setFilter('in_progress')}
          className="rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm hover:border-amber-300"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">In progress</span>
            <Clock3 className="h-5 w-5 text-amber-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {counts.in_progress}
          </div>
        </button>

        <button
          type="button"
          onClick={() => setFilter('resolved')}
          className="rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm hover:border-emerald-300"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Resolved</span>
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {counts.resolved}
          </div>
        </button>

        <button
          type="button"
          onClick={() => setFilter('closed')}
          className="rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm hover:border-slate-400"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Closed</span>
            <XCircle className="h-5 w-5 text-slate-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {counts.closed}
          </div>
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(420px,0.9fr)]">
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-slate-900">Tickets</h2>
              <p className="text-xs text-slate-500">
                {data?.meta?.total ?? 0} total ticket{(data?.meta?.total ?? 0) === 1 ? '' : 's'}
              </p>
            </div>

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as typeof filter)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-400"
            >
              <option value="all">All statuses</option>
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-sm text-slate-500">
              Loading support tickets…
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="p-10 text-center">
              <MessageSquare className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-3 font-medium text-slate-700">No tickets found</p>
              <p className="mt-1 text-sm text-slate-500">
                There are no support tickets matching this filter.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredTickets.map((ticket) => (
                <button
                  key={ticket.id}
                  type="button"
                  onClick={() => {
                    setSelectedId(ticket.id);
                    setError('');
                  }}
                  className={`block w-full px-5 py-4 text-left transition hover:bg-slate-50 ${
                    selectedTicket?.id === ticket.id ? 'bg-indigo-50/60' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-400">
                          #{ticket.id}
                        </span>
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${statusClasses(
                            ticket.status,
                          )}`}
                        >
                          {formatStatus(ticket.status)}
                        </span>
                      </div>

                      <h3 className="mt-2 truncate font-semibold text-slate-900">
                        {ticket.subject}
                      </h3>

                      <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                        {ticket.description}
                      </p>
                    </div>

                    <span className="shrink-0 text-xs text-slate-400">
                      {formatDate(ticket.created_at)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between border-t border-slate-200 px-5 py-3">
            <span className="text-xs text-slate-500">
              Page {data?.meta?.current_page ?? page} of {data?.meta?.last_page ?? 1}
            </span>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1 || isFetching}
                onClick={() => {
                  setPage((value) => Math.max(1, value - 1));
                  setSelectedId(null);
                }}
                className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <button
                type="button"
                disabled={
                  page >= (data?.meta?.last_page ?? 1) || isFetching
                }
                onClick={() => {
                  setPage((value) => value + 1);
                  setSelectedId(null);
                }}
                className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          {!selectedTicket ? (
            <div className="flex min-h-[500px] items-center justify-center p-8 text-center">
              <div>
                <MessageSquare className="mx-auto h-10 w-10 text-slate-300" />
                <p className="mt-3 font-medium text-slate-700">
                  Select a ticket
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Choose a support ticket to view its conversation.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="border-b border-slate-200 px-5 py-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-400">
                        Ticket #{selectedTicket.id}
                      </span>

                      <span
                        className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${statusClasses(
                          selectedTicket.status,
                        )}`}
                      >
                        {formatStatus(selectedTicket.status)}
                      </span>
                    </div>

                    <h2 className="mt-2 text-lg font-bold text-slate-900">
                      {selectedTicket.subject}
                    </h2>
                  </div>

                  <UserRound className="h-5 w-5 shrink-0 text-slate-400" />
                </div>

                <div className="mt-4 rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
                  {selectedTicket.description}
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
                  <div>
                    <div className="text-slate-400">Customer</div>
                    <div className="mt-1 font-medium text-slate-700">
                      #{selectedTicket.customer_id}
                    </div>
                  </div>

                  <div>
                    <div className="text-slate-400">Assigned to</div>
                    <div className="mt-1 font-medium text-slate-700">
                      {selectedTicket.assigned_to
                        ? `#${selectedTicket.assigned_to}`
                        : 'Unassigned'}
                    </div>
                  </div>

                  <div>
                    <div className="text-slate-400">Created</div>
                    <div className="mt-1 font-medium text-slate-700">
                      {formatDate(selectedTicket.created_at)}
                    </div>
                  </div>

                  <div>
                    <div className="text-slate-400">Updated</div>
                    <div className="mt-1 font-medium text-slate-700">
                      {formatDate(selectedTicket.updated_at)}
                    </div>
                  </div>
                </div>

                {canManageStatus && (
                  <div className="mt-4">
                    <label className="mb-1 block text-xs font-medium text-slate-500">
                      Ticket status
                    </label>

                    <select
                      value={selectedTicket.status}
                      disabled={statusMutation.isPending}
                      onChange={(e) =>
                        statusMutation.mutate(
                          e.target.value as
                            | 'open'
                            | 'in_progress'
                            | 'resolved'
                            | 'closed',
                        )
                      }
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-400"
                    >
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="flex max-h-[360px] min-h-[220px] flex-col gap-3 overflow-y-auto p-5">
                {selectedTicket.messages?.length ? (
                  selectedTicket.messages.map((message) => (
                    <div
                      key={message.id}
                      className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs font-semibold text-slate-600">
                          User #{message.user_id}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {formatDate(message.created_at)}
                        </span>
                      </div>

                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                        {message.message}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-1 items-center justify-center text-sm text-slate-400">
                    No messages yet.
                  </div>
                )}
              </div>

              {canReply && (
                <div className="border-t border-slate-200 p-5">
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Reply to customer
                  </label>

                  <textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    rows={4}
                    maxLength={10000}
                    placeholder="Write your response…"
                    className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-indigo-400"
                  />

                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span className="text-xs text-slate-400">
                      {reply.length}/10000
                    </span>

                    <button
                      type="button"
                      onClick={submitReply}
                      disabled={!reply.trim() || replyMutation.isPending}
                      className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Send className="h-4 w-4" />
                      {replyMutation.isPending ? 'Sending…' : 'Send reply'}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
