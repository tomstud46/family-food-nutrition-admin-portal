import { NavLink, Outlet } from 'react-router-dom';
import {
  Bell,
  ChevronDown,
  CircleHelp,
  ClipboardList,
  CreditCard,
  Factory,
  FileBarChart,
  Headphones,
  Home,
  Leaf,
  LogOut,
  Menu,
  Package,
  Search,
  Settings2,
  ShieldCheck,
  ShoppingCart,
  Truck,
  Users,
  Utensils,
  WalletCards,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getUnreadCount } from '../../api/notifications';
import { useAuthStore } from '../../stores/authStore';

const groups = [
  {
    label: 'Overview',
    items: [['/', 'Dashboard', Home]],
  },
  {
    label: 'Customers',
    items: [
      ['/customers', 'Customers', Users],
      ['/households', 'Households', Users],
      ['/nutrition', 'Nutrition', Leaf],
    ],
  },
  {
    label: 'Food Operations',
    items: [
      ['/recipes', 'Recipes & Meals', Utensils],
      ['/inventory', 'Inventory', Package],
      ['/procurement', 'Procurement', ShoppingCart],
      ['/kitchen', 'Kitchen Operations', Factory],
    ],
  },
  {
    label: 'Fulfillment',
    items: [
      ['/orders', 'Orders', ClipboardList],
      ['/payments', 'Payments', CreditCard],
      ['/deliveries', 'Deliveries', Truck],
    ],
  },
  {
    label: 'Management',
    items: [
      ['/notifications', 'Notifications', Bell],
      ['/support', 'Support', Headphones],
      ['/reports', 'Reports & Analytics', FileBarChart],
      ['/ai', 'Admin AI', ShieldCheck],
    ],
  },
] as const;

export default function AdminShell() {
  const [open, setOpen] = useState(false);

  const { data: unread } = useQuery({
    queryKey: ['notification-unread-count'],
    queryFn: getUnreadCount,
    refetchInterval: 30000,
  });

  const { user, logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-[#f6f7f9] text-slate-900">
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-[264px] border-r border-slate-200 bg-[#0f172a] text-white transition-transform lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-[76px] items-center justify-between border-b border-white/10 px-6">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-400 font-black text-slate-950">
                B
              </div>

              <div>
                <div className="font-semibold tracking-tight">Betnutri</div>
                <div className="text-[11px] text-slate-400">
                  Admin Portal
                </div>
              </div>
            </div>

            <button
              className="lg:hidden"
              onClick={() => setOpen(false)}
              aria-label="Close navigation"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-5">
            {groups.map((g) => (
              <div key={g.label} className="mb-6">
                <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[.16em] text-slate-500">
                  {g.label}
                </div>

                {g.items.map(([to, label, Icon]) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={to === '/'}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `group mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition ${
                        isActive
                          ? 'bg-white/10 text-white shadow-sm'
                          : 'text-slate-400 hover:bg-white/[.06] hover:text-slate-100'
                      }`
                    }
                  >
                    <Icon size={17} strokeWidth={1.8} />
                    <span>{label}</span>
                  </NavLink>
                ))}
              </div>
            ))}
          </nav>

          <div className="border-t border-white/10 p-3">
            <NavLink
              to="/settings"
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-slate-400 hover:bg-white/[.06] hover:text-white'
                }`
              }
            >
              <Settings2 size={17} />
              <span>Settings</span>
            </NavLink>

            <button
              onClick={() => logout()}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-400 hover:bg-white/[.06] hover:text-white"
            >
              <LogOut size={17} />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-[264px]">
        <header className="sticky top-0 z-30 flex h-[76px] items-center gap-4 border-b border-slate-200 bg-white/95 px-4 backdrop-blur md:px-7">
          <button
            className="rounded-lg p-2 hover:bg-slate-100 lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open navigation"
          >
            <Menu size={20} />
          </button>

          <div className="hidden max-w-md flex-1 md:block">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={17}
              />

              <input
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
                placeholder="Search customers, orders, recipes..."
              />
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <NavLink
              to="/notifications"
              className="relative rounded-lg p-2.5 text-slate-500 hover:bg-slate-100"
              aria-label="Notifications"
            >
              <Bell size={19} />

              {(unread?.unread_count ?? 0) > 0 && (
                <span className="absolute -right-1 -top-1 min-w-4 rounded-full bg-slate-950 px-1 text-center text-[9px] font-bold leading-4 text-white ring-2 ring-white">
                  {unread!.unread_count > 99
                    ? '99+'
                    : unread!.unread_count}
                </span>
              )}
            </NavLink>

            <NavLink
              to="/support"
              className="rounded-lg p-2.5 text-slate-500 hover:bg-slate-100"
              aria-label="Help and Support"
              title="Help and Support"
            >
              <CircleHelp size={19} />
            </NavLink>

            <div className="ml-2 hidden h-8 w-px bg-slate-200 sm:block" />

            <NavLink
              to="/profile"
              className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-slate-50"
              aria-label="Profile"
              title="Profile"
            >
              <div className="grid h-9 w-9 place-items-center rounded-full bg-slate-900 text-xs font-bold text-white">
                {(user?.name ?? 'A').slice(0, 2).toUpperCase()}
              </div>

              <div className="hidden text-left sm:block">
                <div className="text-xs font-semibold">
                  {user?.name ?? 'Administrator'}
                </div>

                <div className="text-[11px] text-slate-500">
                  {user?.role?.replaceAll('_', ' ') ?? 'Administrator'}
                </div>
              </div>

              <ChevronDown
                size={15}
                className="hidden text-slate-400 sm:block"
              />
            </NavLink>
          </div>
        </header>

        <main className="mx-auto max-w-[1600px] p-4 md:p-7">
          <Outlet />
        </main>
      </div>
    </div>
  );
}