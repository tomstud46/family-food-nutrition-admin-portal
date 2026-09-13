import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  assignRole,
  createStaff,
  listUsers,
  reactivateUser,
  suspendUser,
  updateStaff,
} from '../api/users';
import type { AdminRole } from '../types/auth';
import type { CreateStaffPayload } from '../types/user';

const staffRoles: Exclude<AdminRole, 'super_admin'>[] = [
  'nutritionist',
  'kitchen_operations',
  'procurement',
  'logistics',
];

function roleLabel(role?: string | null) {
  if (!role) return 'No role';
  return role.replaceAll('_', ' ');
}

export default function StaffManagement() {
  const queryClient = useQueryClient();

  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [roleEditingId, setRoleEditingId] = useState<number | null>(null);
  const [suspendingId, setSuspendingId] = useState<number | null>(null);

  const [form, setForm] = useState<CreateStaffPayload>({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role_slug: 'nutritionist',
  });

  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
  });

  const [role, setRole] =
    useState<Exclude<AdminRole, 'super_admin'>>('nutritionist');

  const [suspensionReason, setSuspensionReason] = useState('');

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['staff-users'],
    queryFn: () => listUsers(1, 100),
  });

  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: ['staff-users'] });

  const createMutation = useMutation({
    mutationFn: createStaff,
    onSuccess: async () => {
      setShowCreate(false);
      setForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role_slug: 'nutritionist',
      });
      await refresh();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: {
      id: number;
      payload: { name: string; email: string };
    }) => updateStaff(id, payload),
    onSuccess: async () => {
      setEditingId(null);
      await refresh();
    },
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role_slug }: {
      id: number;
      role_slug: Exclude<AdminRole, 'super_admin'>;
    }) => assignRole(id, { role_slug }),
    onSuccess: async () => {
      setRoleEditingId(null);
      await refresh();
    },
  });

  const suspendMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      suspendUser(id, reason),
    onSuccess: async () => {
      setSuspendingId(null);
      setSuspensionReason('');
      await refresh();
    },
  });

  const reactivateMutation = useMutation({
    mutationFn: reactivateUser,
    onSuccess: refresh,
  });

  const staff = (data?.data ?? []).filter(
    (member) => member.role && member.role !== 'super_admin',
  );

  function startEdit(member: (typeof staff)[number]) {
    setEditingId(member.id);
    setEditForm({
      name: member.name,
      email: member.email,
    });
  }

  function submitCreate(event: React.FormEvent) {
    event.preventDefault();
    createMutation.mutate(form);
  }

  function submitEdit(event: React.FormEvent, id: number) {
    event.preventDefault();
    updateMutation.mutate({
      id,
      payload: editForm,
    });
  }

  function submitSuspend(event: React.FormEvent, id: number) {
    event.preventDefault();

    if (!suspensionReason.trim()) return;

    suspendMutation.mutate({
      id,
      reason: suspensionReason.trim(),
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Staff Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Create and manage operational staff accounts.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreate((value) => !value)}
          className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
        >
          {showCreate ? 'Cancel' : 'Add Staff'}
        </button>
      </div>

      {showCreate && (
        <form
          onSubmit={submitCreate}
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <h2 className="text-lg font-semibold">Create staff account</h2>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="text-sm font-medium">
              Name
              <input
                required
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
                className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 outline-none focus:border-slate-400"
              />
            </label>

            <label className="text-sm font-medium">
              Email
              <input
                required
                type="email"
                value={form.email}
                onChange={(event) =>
                  setForm({ ...form, email: event.target.value })
                }
                className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 outline-none focus:border-slate-400"
              />
            </label>

            <label className="text-sm font-medium">
              Password
              <input
                required
                type="password"
                value={form.password}
                onChange={(event) =>
                  setForm({ ...form, password: event.target.value })
                }
                className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 outline-none focus:border-slate-400"
              />
            </label>

            <label className="text-sm font-medium">
              Confirm password
              <input
                required
                type="password"
                value={form.password_confirmation}
                onChange={(event) =>
                  setForm({
                    ...form,
                    password_confirmation: event.target.value,
                  })
                }
                className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 outline-none focus:border-slate-400"
              />
            </label>

            <label className="text-sm font-medium">
              Role
              <select
                value={form.role_slug}
                onChange={(event) =>
                  setForm({
                    ...form,
                    role_slug: event.target.value as CreateStaffPayload['role_slug'],
                  })
                }
                className="mt-1 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 outline-none focus:border-slate-400"
              >
                {staffRoles.map((staffRole) => (
                  <option key={staffRole} value={staffRole}>
                    {roleLabel(staffRole)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {createMutation.isError && (
            <p className="mt-4 text-sm text-red-600">
              Unable to create the staff account. Check the submitted values.
            </p>
          )}

          <div className="mt-5 flex justify-end">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {createMutation.isPending ? 'Creating...' : 'Create Staff'}
            </button>
          </div>
        </form>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="font-semibold">Operational staff</h2>
          <p className="mt-1 text-xs text-slate-500">
            Super Admin is intentionally excluded from this list.
          </p>
        </div>

        {isLoading && (
          <div className="p-6 text-sm text-slate-500">Loading staff...</div>
        )}

        {isError && (
          <div className="p-6 text-sm text-red-600">
            Failed to load staff.
            {error instanceof Error ? ` ${error.message}` : ''}
          </div>
        )}

        {!isLoading && !isError && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Staff</th>
                  <th className="px-5 py-3 font-semibold">Role</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {staff.map((member) => (
                  <tr key={member.id}>
                    <td className="px-5 py-4">
                      {editingId === member.id ? (
                        <form
                          onSubmit={(event) => submitEdit(event, member.id)}
                          className="space-y-2"
                        >
                          <input
                            required
                            value={editForm.name}
                            onChange={(event) =>
                              setEditForm({
                                ...editForm,
                                name: event.target.value,
                              })
                            }
                            className="h-9 w-full rounded border border-slate-200 px-2"
                          />

                          <input
                            required
                            type="email"
                            value={editForm.email}
                            onChange={(event) =>
                              setEditForm({
                                ...editForm,
                                email: event.target.value,
                              })
                            }
                            className="h-9 w-full rounded border border-slate-200 px-2"
                          />

                          <div className="flex gap-2">
                            <button
                              type="submit"
                              disabled={updateMutation.isPending}
                              className="rounded bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                            >
                              Save
                            </button>

                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="rounded border border-slate-200 px-3 py-1.5 text-xs font-semibold"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      ) : (
                        <>
                          <div className="font-medium text-slate-900">
                            {member.name}
                          </div>
                          <div className="text-xs text-slate-500">
                            {member.email}
                          </div>
                        </>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      {roleEditingId === member.id ? (
                        <div className="flex items-center gap-2">
                          <select
                            value={role}
                            onChange={(event) =>
                              setRole(
                                event.target.value as Exclude<
                                  AdminRole,
                                  'super_admin'
                                >,
                              )
                            }
                            className="h-9 rounded border border-slate-200 bg-white px-2 text-sm"
                          >
                            {staffRoles.map((staffRole) => (
                              <option key={staffRole} value={staffRole}>
                                {roleLabel(staffRole)}
                              </option>
                            ))}
                          </select>

                          <button
                            type="button"
                            disabled={roleMutation.isPending}
                            onClick={() =>
                              roleMutation.mutate({
                                id: member.id,
                                role_slug: role,
                              })
                            }
                            className="rounded bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                          >
                            Save
                          </button>

                          <button
                            type="button"
                            onClick={() => setRoleEditingId(null)}
                            className="rounded border border-slate-200 px-3 py-1.5 text-xs font-semibold"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <span className="capitalize">
                          {roleLabel(member.role)}
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          member.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-red-50 text-red-700'
                        }`}
                      >
                        {member.status}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        {editingId !== member.id && (
                          <button
                            type="button"
                            onClick={() => startEdit(member)}
                            className="rounded border border-slate-200 px-3 py-1.5 text-xs font-semibold hover:bg-slate-50"
                          >
                            Edit
                          </button>
                        )}

                        {roleEditingId !== member.id && (
                          <button
                            type="button"
                            onClick={() => {
                              setRoleEditingId(member.id);
                              setRole(
                                (member.role as Exclude<
                                  AdminRole,
                                  'super_admin'
                                >) ?? 'nutritionist',
                              );
                            }}
                            className="rounded border border-slate-200 px-3 py-1.5 text-xs font-semibold hover:bg-slate-50"
                          >
                            Change role
                          </button>
                        )}

                        {member.status === 'active' &&
                          suspendingId !== member.id && (
                            <button
                              type="button"
                              onClick={() => setSuspendingId(member.id)}
                              className="rounded border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                            >
                              Suspend
                            </button>
                          )}

                        {member.status === 'suspended' &&
                          suspendingId !== member.id && (
                            <button
                              type="button"
                              disabled={reactivateMutation.isPending}
                              onClick={() => reactivateMutation.mutate(member.id)}
                              className="rounded border border-emerald-200 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
                            >
                              Reactivate
                            </button>
                          )}

                        {suspendingId === member.id && (
                          <form
                            onSubmit={(event) =>
                              submitSuspend(event, member.id)
                            }
                            className="flex flex-wrap items-center gap-2"
                          >
                            <input
                              required
                              value={suspensionReason}
                              onChange={(event) =>
                                setSuspensionReason(event.target.value)
                              }
                              placeholder="Suspension reason"
                              className="h-9 rounded border border-slate-200 px-2 text-sm"
                            />

                            <button
                              type="submit"
                              disabled={suspendMutation.isPending}
                              className="rounded bg-red-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                            >
                              Confirm
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setSuspendingId(null);
                                setSuspensionReason('');
                              }}
                              className="rounded border border-slate-200 px-3 py-1.5 text-xs font-semibold"
                            >
                              Cancel
                            </button>
                          </form>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {staff.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-5 py-8 text-center text-sm text-slate-500"
                    >
                      No operational staff accounts found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
