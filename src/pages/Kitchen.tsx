import {useEffect, useState} from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ChefHat,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Play,
  RefreshCw,
  RotateCcw,
  XCircle,
} from 'lucide-react';
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  completeKitchenTask,
  failKitchenTask,
  getKitchenTask,
  listKitchenTasks,
  startKitchenTask,
} from '../api/kitchen';

import type { KitchenTask } from '../types/kitchen';
import { useAuthStore } from '../stores/authStore';
import {useAdminPortalPreferencesStore} from '../stores/adminPortalPreferencesStore';

const errorText = (e: any) =>
  e?.response?.data?.message ||
  e?.response?.data?.error ||
  Object.values(e?.response?.data?.errors || {})?.flat?.()?.[0] ||
  'The request could not be completed.';

const statusTone = (status: string) => {
  switch (status) {
    case 'queued':
      return 'border-amber-100 bg-amber-50 text-amber-700';
    case 'in_progress':
      return 'border-blue-100 bg-blue-50 text-blue-700';
    case 'completed':
      return 'border-emerald-100 bg-emerald-50 text-emerald-700';
    case 'failed':
      return 'border-rose-100 bg-rose-50 text-rose-700';
    default:
      return 'border-slate-200 bg-slate-50 text-slate-600';
  }
};

const statusLabel = (status: string) =>
  status.replace(/[_-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const dateText = (value: string | null) =>
  value ? new Date(value).toLocaleString() : '—';

export default function Kitchen() {
  const { user } = useAuthStore();
  const role = user?.role;

  const canOperate =
    role === 'super_admin' || role === 'kitchen_operations';

  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<number | null>(null);
  const [filter, setFilter] = useState('all');
  const [failOpen, setFailOpen] = useState(false);
  const [failureReason, setFailureReason] = useState('');

  const qc = useQueryClient();
const pageSize = useAdminPortalPreferencesStore((state) => state.preferences?.page_size ?? 25);
useEffect(() => { setPage(1); }, [pageSize]);

  const list = useQuery({
    queryKey: ['kitchen-tasks', page, pageSize],
    queryFn: () => listKitchenTasks(page, pageSize),
  });

  const detail = useQuery({
    queryKey: ['kitchen-task', selected],
    queryFn: () => getKitchenTask(selected!),
    enabled: !!selected,
  });

  const mutation = useMutation({
    mutationFn: async ({
      action,
      id,
      reason,
    }: {
      action: 'start' | 'complete' | 'fail';
      id: number;
      reason?: string;
    }) => {
      if (action === 'start') return startKitchenTask(id);
      if (action === 'complete') return completeKitchenTask(id);
      return failKitchenTask(id, reason!);
    },
    onSuccess: (_, variables) => {
      setFailOpen(false);
      setFailureReason('');

      qc.invalidateQueries({ queryKey: ['kitchen-tasks'] });
      qc.invalidateQueries({
        queryKey: ['kitchen-task', variables.id],
      });
    },
  });

  const tasks = list.data?.data ?? [];

  const filtered =
    filter === 'all'
      ? tasks
      : tasks.filter((task) => task.status === filter);

  const selectedTask = detail.data;

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ['kitchen-tasks'] });

    if (selected) {
      qc.invalidateQueries({
        queryKey: ['kitchen-task', selected],
      });
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[.14em] text-slate-600">
          <ChefHat size={13} />
          Food production
        </div>

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
              Kitchen Operations
            </h1>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
              Manage production tasks from the queue through completion.
              Starting a task automatically assigns it to the authenticated
              kitchen operator.
            </p>
          </div>

          <button
            onClick={refresh}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 shadow-sm hover:bg-slate-50"
          >
            <RefreshCw size={15} />
            Refresh
          </button>
        </div>
      </header>

      {!canOperate && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          You can view kitchen operations, but your current role does not have
          permission to start, complete, or fail tasks.
        </div>
      )}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-4">
          <div>
            <h2 className="text-sm font-semibold">Production queue</h2>
            <p className="mt-1 text-xs text-slate-500">
              Select a task to inspect its operational state.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {['all', 'queued', 'in_progress', 'completed', 'failed'].map(
              (status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                    filter === status
                      ? 'bg-slate-950 text-white'
                      : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {status === 'all' ? 'All' : statusLabel(status)}
                </button>
              ),
            )}
          </div>
        </div>

        {list.isLoading ? (
          <Loading />
        ) : list.isError ? (
          <ErrorState message={errorText(list.error)} />
        ) : !filtered.length ? (
          <Empty filter={filter} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Task</th>
                    <th className="px-5 py-3">Meal</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Assigned to</th>
                    <th className="px-5 py-3">Created</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filtered.map((task) => (
                    <tr
                      key={task.id}
                      onClick={() => setSelected(task.id)}
                      className={`cursor-pointer transition hover:bg-slate-50 ${
                        selected === task.id ? 'bg-slate-50' : ''
                      }`}
                    >
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-900">
                          Kitchen task #{task.id}
                        </div>
                        <div className="mt-1 text-xs text-slate-400">
                          Created {dateText(task.created_at)}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="font-semibold text-slate-700">
                          Meal #{task.meal_id}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusTone(
                            task.status,
                          )}`}
                        >
                          {statusLabel(task.status)}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-xs text-slate-500">
                        {task.assigned_to
                          ? `User #${task.assigned_to}`
                          : 'Unassigned'}
                      </td>

                      <td className="px-5 py-4 text-xs text-slate-500">
                        {dateText(task.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pager
              page={page}
              last={list.data?.meta.last_page ?? 1}
              setPage={setPage}
            />
          </>
        )}
      </section>

      {selectedTask && (
        <TaskDetail
          task={selectedTask}
          canOperate={canOperate}
          busy={mutation.isPending}
          onStart={() =>
            mutation.mutate({
              action: 'start',
              id: selectedTask.id,
            })
          }
          onComplete={() =>
            mutation.mutate({
              action: 'complete',
              id: selectedTask.id,
            })
          }
          onFail={() => setFailOpen(true)}
        />
      )}

      {failOpen && selectedTask && (
        <Modal
          title={`Fail kitchen task #${selectedTask.id}`}
          onClose={() => {
            if (!mutation.isPending) {
              setFailOpen(false);
              setFailureReason('');
            }
          }}
        >
          <p className="text-sm leading-6 text-slate-500">
            Explain why the production task could not be completed. This
            records the authoritative failure reason.
          </p>

          <textarea
            value={failureReason}
            onChange={(e) => setFailureReason(e.target.value)}
            rows={5}
            className="mt-4 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-slate-400"
            placeholder="Describe the production failure..."
          />

          <div className="mt-4 flex justify-end gap-2">
            <button
              disabled={mutation.isPending}
              onClick={() => {
                setFailOpen(false);
                setFailureReason('');
              }}
              className="rounded-lg px-4 py-2 text-sm text-slate-600 disabled:opacity-40"
            >
              Cancel
            </button>

            <button
              disabled={
                mutation.isPending || failureReason.trim().length < 5
              }
              onClick={() =>
                mutation.mutate({
                  action: 'fail',
                  id: selectedTask.id,
                  reason: failureReason.trim(),
                })
              }
              className="inline-flex items-center gap-2 rounded-lg bg-rose-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
            >
              <XCircle size={15} />
              {mutation.isPending ? 'Saving…' : 'Mark failed'}
            </button>
          </div>
        </Modal>
      )}

      {mutation.isError && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm rounded-xl border border-rose-200 bg-white p-4 shadow-xl">
          <div className="flex gap-3">
            <AlertTriangle className="shrink-0 text-rose-600" size={18} />
            <div>
              <div className="text-sm font-semibold">Action failed</div>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                {errorText(mutation.error)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TaskDetail({
  task,
  canOperate,
  busy,
  onStart,
  onComplete,
  onFail,
}: {
  task: KitchenTask;
  canOperate: boolean;
  busy: boolean;
  onStart: () => void;
  onComplete: () => void;
  onFail: () => void;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            <Clock3 size={14} />
            Task detail
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h2 className="text-lg font-semibold text-slate-950">
              Kitchen task #{task.id}
            </h2>

            <span
              className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusTone(
                task.status,
              )}`}
            >
              {statusLabel(task.status)}
            </span>
          </div>

          <p className="mt-1 text-sm text-slate-500">
            Production task for Meal #{task.meal_id}
          </p>
        </div>

        {canOperate && (
          <div className="flex flex-wrap gap-2">
            {task.status === 'queued' && (
              <button
                disabled={busy}
                onClick={onStart}
                className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-xs font-semibold text-white disabled:opacity-40"
              >
                <Play size={14} />
                {busy ? 'Starting…' : 'Start task'}
              </button>
            )}

            {task.status === 'in_progress' && (
              <>
                <button
                  disabled={busy}
                  onClick={onComplete}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-xs font-semibold text-white disabled:opacity-40"
                >
                  <CheckCircle2 size={14} />
                  {busy ? 'Completing…' : 'Complete task'}
                </button>

                <button
                  disabled={busy}
                  onClick={onFail}
                  className="inline-flex items-center gap-2 rounded-lg border border-rose-200 px-4 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-40"
                >
                  <XCircle size={14} />
                  Mark failed
                </button>
              </>
            )}

            {task.status === 'failed' && (
              <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-500">
                <RotateCcw size={14} />
                Failed task requires operational review
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Meal" value={`#${task.meal_id}`} />
        <Stat
          label="Assigned to"
          value={
            task.assigned_to ? `User #${task.assigned_to}` : 'Unassigned'
          }
        />
        <Stat label="Started" value={dateText(task.started_at)} />
        <Stat label="Completed" value={dateText(task.completed_at)} />
      </div>

      {task.notes && (
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Notes
          </div>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
            {task.notes}
          </p>
        </div>
      )}

      {task.failure_reason && (
        <div className="mt-4 rounded-xl border border-rose-100 bg-rose-50 p-4">
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wide text-rose-600">
            <XCircle size={13} />
            Failure reason
          </div>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-rose-800">
            {task.failure_reason}
          </p>
        </div>
      )}

      <div className="mt-5 border-t border-slate-100 pt-4 text-xs text-slate-400">
        Created {dateText(task.created_at)}
      </div>
    </section>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold text-slate-800">
        {value}
      </div>
    </div>
  );
}

function Pager({
  page,
  last,
  setPage,
}: {
  page: number;
  last: number;
  setPage: (page: number) => void;
}) {
  return (
    <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
      <span className="text-xs text-slate-400">
        Page {page} of {last}
      </span>

      <div className="flex gap-2">
        <button
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
          className="rounded-lg border p-2 disabled:opacity-30"
        >
          <ChevronLeft size={15} />
        </button>

        <button
          disabled={page >= last}
          onClick={() => setPage(page + 1)}
          className="rounded-lg border p-2 disabled:opacity-30"
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/35 p-4">
      <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-950">
            {title}
          </h2>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
          >
            ×
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

function Loading() {
  return (
    <div className="p-12 text-center text-sm text-slate-400">
      Loading kitchen tasks…
    </div>
  );
}

function Empty({ filter }: { filter: string }) {
  return (
    <div className="p-14 text-center">
      <ChefHat className="mx-auto text-slate-300" size={36} />

      <h2 className="mt-4 text-sm font-semibold text-slate-800">
        No kitchen tasks
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        {filter === 'all'
          ? 'There are no production tasks available yet.'
          : `There are no ${statusLabel(filter).toLowerCase()} tasks.`}
      </p>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="p-12 text-center text-sm text-rose-600">
      {message}
    </div>
  );
}
