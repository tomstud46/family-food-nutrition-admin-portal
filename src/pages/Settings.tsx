import { useEffect, useState } from 'react';
import {
  Bell,
  CheckCircle2,
  KeyRound,
  Loader2,
  Settings2,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { changePassword } from '../api/auth';
import {
  getNotificationPreferences,
  updateNotificationPreferences,
} from '../api/notificationPreferences';
import { listSessions, revokeOtherSessions, revokeSession } from '../api/sessions';
import type { NotificationPreferences } from '../types/notificationPreferences';
import type { Session } from '../types/sessions';
import { useAuthStore } from '../stores/authStore';
import { useAdminPortalPreferencesStore } from '../stores/adminPortalPreferencesStore';
import type {
  AdminPortalPageSize,
  AdminPortalTheme,
} from '../types/adminPortalPreferences';

const schema = z
  .object({
    current_password: z.string().optional(),
    password: z
      .string()
      .min(8, 'New password must be at least 8 characters.'),
    password_confirmation: z
      .string()
      .min(1, 'Please confirm the new password.'),
  })
  .refine((data) => data.password === data.password_confirmation, {
    path: ['password_confirmation'],
    message: 'The password confirmation does not match.',
  });

type FormData = z.infer<typeof schema>;

export default function Settings() {
  const { user } = useAuthStore();
  const isSuperAdmin = user?.role === 'super_admin';

  const {
    preferences,
    isLoading: adminPreferencesLoading,
    isSaving: adminPreferencesSaving,
    error: adminPreferencesError,
    load: loadAdminPreferences,
    setTheme,
    setPageSize,
    setSidebarCollapsed,
  } = useAdminPortalPreferencesStore();

  const [adminPreferencesSuccess, setAdminPreferencesSuccess] =
    useState<string | null>(null);

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const [notificationPreferences, setNotificationPreferences] =
    useState<NotificationPreferences | null>(null);
  const [notificationPreferencesLoading, setNotificationPreferencesLoading] =
    useState(true);
  const [notificationPreferencesSaving, setNotificationPreferencesSaving] =
    useState(false);
  const [notificationPreferencesError, setNotificationPreferencesError] =
    useState<string | null>(null);
  const [notificationPreferencesSuccess, setNotificationPreferencesSuccess] =
    useState<string | null>(null);

  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [sessionsError, setSessionsError] = useState<string | null>(null);
  const [sessionsActionLoading, setSessionsActionLoading] = useState<
    number | 'others' | null
  >(null);
  const [sessionsSuccess, setSessionsSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      current_password: '',
      password: '',
      password_confirmation: '',
    },
  });

  useEffect(() => {
    setSuccessMessage(null);
    setServerError(null);
    setAdminPreferencesSuccess(null);
  }, [user?.id]);

  useEffect(() => {
    let cancelled = false;

    const loadAdminPortalPreferences = async () => {
      try {
        await loadAdminPreferences(user!.id);
      } catch {
        // Store exposes the error to the Settings UI.
      }
    };

    if (user?.id) {
      loadAdminPortalPreferences();
    }

    return () => {
      cancelled = true;
    };
  }, [user?.id, loadAdminPreferences]);

  useEffect(() => {
    const theme = preferences?.theme ?? 'system';
    document.documentElement.dataset.adminTheme = theme;

    return () => {
      delete document.documentElement.dataset.adminTheme;
    };
  }, [preferences?.theme]);

  useEffect(() => {
    let cancelled = false;

    const loadNotificationPreferences = async () => {
      setNotificationPreferencesLoading(true);
      setNotificationPreferencesError(null);
      setNotificationPreferencesSuccess(null);

      try {
        const preferences = await getNotificationPreferences();

        if (!cancelled) {
          setNotificationPreferences(preferences);
        }
      } catch (error: any) {
        if (!cancelled) {
          setNotificationPreferencesError(
            error.response?.data?.message ??
              'Unable to load notification preferences.',
          );
        }
      } finally {
        if (!cancelled) {
          setNotificationPreferencesLoading(false);
        }
      }
    };

    if (user?.id) {
      loadNotificationPreferences();
    } else {
      setNotificationPreferencesLoading(false);
      setNotificationPreferences(null);
    }

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  useEffect(() => {
    let cancelled = false;

    const loadSessions = async () => {
      setSessionsLoading(true);
      setSessionsError(null);
      setSessionsSuccess(null);

      try {
        const currentSessions = await listSessions();

        if (!cancelled) {
          setSessions(currentSessions);
        }
      } catch (error: any) {
        if (!cancelled) {
          setSessionsError(
            error.response?.data?.message ??
              'Unable to load active sessions.',
          );
        }
      } finally {
        if (!cancelled) {
          setSessionsLoading(false);
        }
      }
    };

    if (user?.id) {
      loadSessions();
    } else {
      setSessionsLoading(false);
      setSessions([]);
    }

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const saveNotificationPreferences = async () => {
    if (!notificationPreferences) {
      return;
    }

    setNotificationPreferencesSaving(true);
    setNotificationPreferencesError(null);
    setNotificationPreferencesSuccess(null);

    try {
      const updated = await updateNotificationPreferences(
        notificationPreferences,
      );

      setNotificationPreferences(updated);
      setNotificationPreferencesSuccess(
        'Notification preferences saved successfully.',
      );
    } catch (error: any) {
      setNotificationPreferencesError(
        error.response?.data?.message ??
          'Unable to save notification preferences.',
      );
    } finally {
      setNotificationPreferencesSaving(false);
    }
  };

  const handleRevokeSession = async (session: Session) => {
    if (session.current) {
      return;
    }

    setSessionsActionLoading(session.id);
    setSessionsError(null);
    setSessionsSuccess(null);

    try {
      const response = await revokeSession(session.id);

      setSessions((current) =>
        current.filter((item) => item.id !== session.id),
      );

      setSessionsSuccess(
        response.message || 'Session revoked successfully.',
      );
    } catch (error: any) {
      setSessionsError(
        error.response?.data?.message ??
          'Unable to revoke this session.',
      );
    } finally {
      setSessionsActionLoading(null);
    }
  };

  const handleRevokeOtherSessions = async () => {
    setSessionsActionLoading('others');
    setSessionsError(null);
    setSessionsSuccess(null);

    try {
      const response = await revokeOtherSessions();

      setSessions((current) => current.filter((session) => session.current));

      setSessionsSuccess(
        response.revoked_count > 0
          ? `${response.revoked_count} other session${
              response.revoked_count === 1 ? '' : 's'
            } revoked successfully.`
          : 'There were no other sessions to revoke.',
      );
    } catch (error: any) {
      setSessionsError(
        error.response?.data?.message ??
          'Unable to revoke other sessions.',
      );
    } finally {
      setSessionsActionLoading(null);
    }
  };

  const submit = async (values: FormData) => {
    setSuccessMessage(null);
    setServerError(null);

    const parsed = schema.safeParse(values);

    if (!parsed.success) {
      parsed.error.issues.forEach((issue) => {
        const field = issue.path[0];

        if (
          field === 'current_password' ||
          field === 'password' ||
          field === 'password_confirmation'
        ) {
          setError(field, { message: issue.message });
        }
      });

      return;
    }

    if (!isSuperAdmin && !values.current_password?.trim()) {
      setError('current_password', {
        message: 'Current password is required.',
      });
      return;
    }

    try {
      const payload = {
        ...(isSuperAdmin
          ? {}
          : { current_password: values.current_password }),
        password: values.password,
        password_confirmation: values.password_confirmation,
      };

      const response = await changePassword(payload);

      setSuccessMessage(
        response.message || 'Your password was changed successfully.',
      );

      reset();
    } catch (error: any) {
      const response = error.response?.data;

      if (response?.errors) {
        const currentPasswordError =
          response.errors.current_password?.[0];
        const passwordError = response.errors.password?.[0];
        const confirmationError =
          response.errors.password_confirmation?.[0];

        if (currentPasswordError) {
          setError('current_password', {
            message: currentPasswordError,
          });
        }

        if (passwordError) {
          setError('password', {
            message: passwordError,
          });
        }

        if (confirmationError) {
          setError('password_confirmation', {
            message: confirmationError,
          });
        }
      }

      setServerError(
        response?.message ??
          'Unable to change your password. Please check the form and try again.',
      );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
          Settings
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your Admin Portal account and security settings.
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
              Manage security settings for your administrator account.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h2 className="font-semibold text-slate-900">
            Admin Portal Preferences
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Customize the appearance and layout of your Admin Portal.
          </p>
        </div>

        {adminPreferencesLoading ? (
          <div className="mt-6 flex items-center gap-2 text-sm text-slate-500">
            <Loader2 size={16} className="animate-spin" />
            Loading portal preferences…
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            {adminPreferencesError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {adminPreferencesError}
              </div>
            )}

            {adminPreferencesSuccess && (
              <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                <CheckCircle2 size={17} className="mt-0.5 shrink-0" />
                {adminPreferencesSuccess}
              </div>
            )}

            <div>
              <label className="text-sm font-semibold text-slate-900">
                Appearance
              </label>
              <p className="mt-1 text-xs text-slate-500">
                Choose how the Admin Portal should appear.
              </p>

              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {(['system', 'light', 'dark'] as AdminPortalTheme[]).map(
                  (theme) => (
                    <button
                      key={theme}
                      type="button"
                      disabled={adminPreferencesSaving}
                      onClick={async () => {
                        try {
                          setAdminPreferencesSuccess(null);
                          await setTheme(theme);
                          setAdminPreferencesSuccess(
                            'Appearance preference saved.',
                          );
                        } catch {
                          // Store exposes the save error.
                        }
                      }}
                      className={`rounded-lg border px-4 py-3 text-left text-sm transition ${
                        preferences?.theme === theme
                          ? 'border-slate-900 bg-slate-900 text-white'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400'
                      } disabled:cursor-not-allowed disabled:opacity-60`}
                    >
                      <div className="font-semibold capitalize">{theme}</div>
                      <div
                        className={`mt-1 text-xs ${
                          preferences?.theme === theme
                            ? 'text-slate-300'
                            : 'text-slate-500'
                        }`}
                      >
                        {theme === 'system'
                          ? 'Follow your device'
                          : theme === 'light'
                            ? 'Use the light interface'
                            : 'Use the dark interface'}
                      </div>
                    </button>
                  ),
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-900">
                Rows per page
              </label>
              <p className="mt-1 text-xs text-slate-500">
                Default number of records shown in paginated lists.
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                {([10, 25, 50, 100] as AdminPortalPageSize[]).map(
                  (pageSize) => (
                    <button
                      key={pageSize}
                      type="button"
                      disabled={adminPreferencesSaving}
                      onClick={async () => {
                        try {
                          setAdminPreferencesSuccess(null);
                          await setPageSize(pageSize);
                          setAdminPreferencesSuccess(
                            'Rows-per-page preference saved.',
                          );
                        } catch {
                          // Store exposes the save error.
                        }
                      }}
                      className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                        preferences?.page_size === pageSize
                          ? 'border-slate-900 bg-slate-900 text-white'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400'
                      } disabled:cursor-not-allowed disabled:opacity-60`}
                    >
                      {pageSize}
                    </button>
                  ),
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-900">
                Sidebar
              </label>
              <p className="mt-1 text-xs text-slate-500">
                Choose whether the navigation sidebar starts expanded or
                collapsed.
              </p>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {[
                  { value: false, label: 'Expanded' },
                  { value: true, label: 'Collapsed' },
                ].map((option) => (
                  <button
                    key={option.label}
                    type="button"
                    disabled={adminPreferencesSaving}
                    onClick={async () => {
                      try {
                        setAdminPreferencesSuccess(null);
                        await setSidebarCollapsed(option.value);
                        setAdminPreferencesSuccess(
                          'Sidebar preference saved.',
                        );
                      } catch {
                        // Store exposes the save error.
                      }
                    }}
                    className={`rounded-lg border px-4 py-3 text-left text-sm font-semibold transition ${
                      preferences?.sidebar_collapsed === option.value
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400'
                    } disabled:cursor-not-allowed disabled:opacity-60`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {adminPreferencesSaving && (
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Loader2 size={14} className="animate-spin" />
                Saving preference…
              </div>
            )}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-600">
            <KeyRound size={20} />
          </div>

          <div>
            <h2 className="font-semibold text-slate-900">
              Change Password
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Update the password used to access the Admin Portal.
            </p>
          </div>
        </div>

        {isSuperAdmin && (
          <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            Super Admin accounts can change their password without entering
            the current password.
          </div>
        )}

        {successMessage && (
          <div className="mt-5 flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <CheckCircle2 size={17} className="mt-0.5 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {serverError && (
          <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {serverError}
          </div>
        )}

        <form
          onSubmit={handleSubmit(submit)}
          className="mt-6 max-w-xl space-y-5"
          noValidate
        >
          {!isSuperAdmin && (
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-900">
                Current password
              </span>

              <input
                {...register('current_password')}
                type="password"
                autoComplete="current-password"
                className="h-12 w-full rounded-lg border border-slate-200 px-3.5 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                placeholder="Enter your current password"
              />

              {errors.current_password && (
                <span className="mt-1.5 block text-xs text-red-600">
                  {errors.current_password.message}
                </span>
              )}
            </label>
          )}

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-900">
              New password
            </span>

            <input
              {...register('password')}
              type="password"
              autoComplete="new-password"
              className="h-12 w-full rounded-lg border border-slate-200 px-3.5 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
              placeholder="Enter a new password"
            />

            {errors.password && (
              <span className="mt-1.5 block text-xs text-red-600">
                {errors.password.message}
              </span>
            )}
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-900">
              Confirm new password
            </span>

            <input
              {...register('password_confirmation')}
              type="password"
              autoComplete="new-password"
              className="h-12 w-full rounded-lg border border-slate-200 px-3.5 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
              placeholder="Confirm your new password"
            />

            {errors.password_confirmation && (
              <span className="mt-1.5 block text-xs text-red-600">
                {errors.password_confirmation.message}
              </span>
            )}
          </label>

          <div className="pt-1">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex h-11 items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Changing password…
                </>
              ) : (
                'Change password'
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-600">
              <KeyRound size={20} />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">
                Security & Active Sessions
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Review the active sessions connected to your Admin Portal account.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRevokeOtherSessions}
            disabled={
              sessionsLoading ||
              sessionsActionLoading !== null ||
              sessions.filter((session) => !session.current).length === 0
            }
            className="shrink-0 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {sessionsActionLoading === 'others' ? (
              <span className="flex items-center gap-2">
                <Loader2 size={14} className="animate-spin" />
                Revoking…
              </span>
            ) : (
              'Revoke other sessions'
            )}
          </button>
        </div>

        {sessionsLoading ? (
          <div className="mt-6 flex items-center gap-2 text-sm text-slate-500">
            <Loader2 size={16} className="animate-spin" />
            Loading active sessions…
          </div>
        ) : sessionsError ? (
          <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {sessionsError}
          </div>
        ) : (
          <>
            {sessionsSuccess && (
              <div className="mt-5 flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                <CheckCircle2 size={17} className="mt-0.5 shrink-0" />
                <span>{sessionsSuccess}</span>
              </div>
            )}

            <div className="mt-6 space-y-3">
              {sessions.length === 0 ? (
                <div className="rounded-lg border border-slate-200 px-4 py-4 text-sm text-slate-500">
                  No active sessions were found.
                </div>
              ) : (
                sessions.map((session) => (
                  <div
                    key={session.id}
                    className="rounded-lg border border-slate-200 px-4 py-4"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold text-slate-900">
                            Signed-in session
                          </span>

                          {session.current && (
                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                              Current session
                            </span>
                          )}
                        </div>

                        <p className="mt-1 text-xs text-slate-500">
                          Session type: {session.name}
                        </p>

                        <div className="mt-2 space-y-1 text-xs text-slate-500">
                          <p>
                            Created:{' '}
                            {new Date(session.created_at).toLocaleString()}
                          </p>

                          <p>
                            Last used:{' '}
                            {session.last_used_at
                              ? new Date(
                                  session.last_used_at,
                                ).toLocaleString()
                              : 'Not recorded'}
                          </p>

                          {session.expires_at && (
                            <p>
                              Expires:{' '}
                              {new Date(
                                session.expires_at,
                              ).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>

                      {!session.current && (
                        <button
                          type="button"
                          onClick={() => handleRevokeSession(session)}
                          disabled={sessionsActionLoading !== null}
                          className="shrink-0 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {sessionsActionLoading === session.id ? (
                            <span className="flex items-center gap-2">
                              <Loader2 size={14} className="animate-spin" />
                              Revoking…
                            </span>
                          ) : (
                            'Revoke'
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <p className="mt-4 text-xs text-slate-500">
              Session information is limited to what the authentication
              system records. Device, browser, and IP details are not
              available for these sessions.
            </p>
          </>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-600">
            <Bell size={20} />
          </div>

          <div>
            <h2 className="font-semibold text-slate-900">
              Notification Preferences
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Choose which types of notifications you want to receive.
            </p>
          </div>
        </div>

        {notificationPreferencesLoading ? (
          <div className="mt-6 flex items-center gap-2 text-sm text-slate-500">
            <Loader2 size={16} className="animate-spin" />
            Loading notification preferences…
          </div>
        ) : notificationPreferencesError ? (
          <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {notificationPreferencesError}
          </div>
        ) : notificationPreferences ? (
          <>
            {notificationPreferencesSuccess && (
              <div className="mt-5 flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                <CheckCircle2 size={17} className="mt-0.5 shrink-0" />
                <span>{notificationPreferencesSuccess}</span>
              </div>
            )}

            <div className="mt-6 max-w-xl divide-y divide-slate-100 rounded-lg border border-slate-200">
              {(
                [
                  ['orders', 'Orders', 'Notifications about orders and order status.'],
                  ['payments', 'Payments', 'Notifications about successful or failed payments.'],
                  ['delivery', 'Delivery', 'Notifications about delivery assignments and delivery status.'],
                  ['nutrition', 'Nutrition', 'Notifications about nutrition plans, allergies, and restrictions.'],
                  ['support', 'Support', 'Notifications about support ticket replies and status changes.'],
                  [
                    'account_security',
                    'Account & Security',
                    'Notifications about account security and account status changes.',
                  ],
                ] as const
              ).map(([key, label, description]) => (
                <label
                  key={key}
                  className="flex cursor-pointer items-center justify-between gap-4 px-4 py-4"
                >
                  <span>
                    <span className="block text-sm font-medium text-slate-900">
                      {label}
                    </span>
                    <span className="mt-1 block text-xs text-slate-500">
                      {description}
                    </span>
                  </span>

                  <input
                    type="checkbox"
                    checked={notificationPreferences[key]}
                    onChange={(event) => {
                      setNotificationPreferences((current) =>
                        current
                          ? {
                              ...current,
                              [key]: event.target.checked,
                            }
                          : current,
                      );
                      setNotificationPreferencesSuccess(null);
                    }}
                    className="h-5 w-5 shrink-0 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
                  />
                </label>
              ))}
            </div>

            <div className="mt-5">
              <button
                type="button"
                onClick={saveNotificationPreferences}
                disabled={notificationPreferencesSaving}
                className="flex h-11 items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {notificationPreferencesSaving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Saving preferences…
                  </>
                ) : (
                  'Save notification preferences'
                )}
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
