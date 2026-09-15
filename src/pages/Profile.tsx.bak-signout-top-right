import { useEffect, useState } from 'react';
import { UserCircle } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { getProfile, updateProfile } from '../api/profile';

function formatRole(role?: string | null): string {
  if (!role) return 'Administrator';

  return role
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatDate(date?: string): string {
  if (!date) return 'Not available';

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function Profile() {
  const { user } = useAuthStore();

  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      setIsLoadingProfile(true);

      try {
        const profile = await getProfile();

        if (!cancelled) {
          setName(profile.name);
          setEmail(profile.email);

          localStorage.setItem('ffn_admin_user', JSON.stringify(profile));
          useAuthStore.setState({ user: profile });
        }
      } catch {
        // Keep the already-hydrated auth user if the profile request fails.
      } finally {
        if (!cancelled) {
          setIsLoadingProfile(false);
        }
      }
    }

    void loadProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  function handleCancel() {
    setName(user?.name ?? '');
    setEmail(user?.email ?? '');
    setError(null);
    setSuccess(null);
    setIsEditing(false);
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);
    setSuccess(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      setError('Name is required.');
      return;
    }

    if (!trimmedEmail) {
      setError('Email is required.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await updateProfile({
        name: trimmedName,
        email: trimmedEmail,
      });

      localStorage.setItem('ffn_admin_user', JSON.stringify(response.user));
      useAuthStore.setState({ user: response.user });

      setName(response.user.name);
      setEmail(response.user.email);
      setSuccess(response.message ?? 'Profile updated successfully.');
      setIsEditing(false);
    } catch (requestError: any) {
      const validationErrors = requestError.response?.data?.errors;

      const firstValidationError = validationErrors
        ? Object.values(validationErrors).flat()[0]
        : null;

      setError(
        typeof firstValidationError === 'string'
          ? firstValidationError
          : requestError.response?.data?.message ??
              'Unable to update your profile. Please try again.',
      );
    } finally {
      setIsLoading(false);
    }
  }

  const displayName = user?.name ?? 'Administrator';
  const displayEmail = user?.email ?? 'No email available';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
            Profile
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            View and manage your administrator profile and account information.
          </p>
        </div>

        {!isEditing && (
          <button
            type="button"
            onClick={() => {
              setError(null);
              setSuccess(null);
              setName(user?.name ?? '');
              setEmail(user?.email ?? '');
              setIsEditing(true);
            }}
            disabled={isLoadingProfile}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Edit Profile
          </button>
        )}
      </div>

      {success && (
        <div
          role="status"
          className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
        >
          {success}
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-slate-900 text-white">
            <UserCircle size={28} />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {displayName}
            </h2>
            <p className="text-sm text-slate-500">{displayEmail}</p>
          </div>
        </div>

        {isEditing ? (
          <form onSubmit={handleSave} className="mt-6 space-y-5">
            <div>
              <label
                htmlFor="profile-name"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Name
              </label>
              <input
                id="profile-name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                disabled={isLoading}
                maxLength={255}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-50"
              />
            </div>

            <div>
              <label
                htmlFor="profile-email"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Email
              </label>
              <input
                id="profile-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={isLoading}
                maxLength={255}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-50"
              />
              <p className="mt-1.5 text-xs text-slate-500">
                Changing your email may require email verification again.
              </p>
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isLoading}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-slate-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Name
              </div>
              <div className="mt-1 text-sm font-medium text-slate-900">
                {displayName}
              </div>
            </div>

            <div className="rounded-lg bg-slate-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Role
              </div>
              <div className="mt-1 text-sm font-medium text-slate-900">
                {formatRole(user?.role)}
              </div>
            </div>

            <div className="rounded-lg bg-slate-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Email
              </div>
              <div className="mt-1 break-all text-sm font-medium text-slate-900">
                {displayEmail}
              </div>
            </div>

            <div className="rounded-lg bg-slate-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Status
              </div>
              <div className="mt-1 text-sm font-medium capitalize text-slate-900">
                {user?.status ?? 'Unknown'}
              </div>
            </div>

            <div className="rounded-lg bg-slate-50 p-4 sm:col-span-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Member Since
              </div>
              <div className="mt-1 text-sm font-medium text-slate-900">
                {formatDate(user?.created_at)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
