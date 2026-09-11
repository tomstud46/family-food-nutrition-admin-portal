import { UserCircle } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

export default function Profile() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
          Profile
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          View your administrator profile and account information.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-slate-900 text-white">
            <UserCircle size={28} />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {user?.name ?? 'Administrator'}
            </h2>
            <p className="text-sm text-slate-500">
              {user?.email ?? 'No email available'}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg bg-slate-50 p-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Name
            </div>
            <div className="mt-1 text-sm font-medium text-slate-900">
              {user?.name ?? 'Administrator'}
            </div>
          </div>

          <div className="rounded-lg bg-slate-50 p-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Role
            </div>
            <div className="mt-1 text-sm font-medium capitalize text-slate-900">
              {user?.role?.replaceAll('_', ' ') ?? 'Administrator'}
            </div>
          </div>

          <div className="rounded-lg bg-slate-50 p-4 sm:col-span-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Email
            </div>
            <div className="mt-1 text-sm font-medium text-slate-900">
              {user?.email ?? 'No email available'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
