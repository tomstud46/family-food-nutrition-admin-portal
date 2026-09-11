import { Settings2 } from 'lucide-react';

export default function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
          Settings
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage Admin Portal preferences and configuration.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-slate-100 text-slate-600">
            <Settings2 size={20} />
          </div>

          <div>
            <h2 className="font-semibold text-slate-900">
              Portal Settings
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Settings for the Admin Portal will be managed here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
