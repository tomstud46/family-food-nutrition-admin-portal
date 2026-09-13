import { create } from 'zustand';
import {
  getAdminPortalPreferences,
  updateAdminPortalPreferences,
} from '../api/adminPortalPreferences';
import type {
  AdminPortalPageSize,
  AdminPortalPreferences,
  AdminPortalTheme,
} from '../types/adminPortalPreferences';

interface AdminPortalPreferencesState {
  preferences: AdminPortalPreferences | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  load: (userId: number | string) => Promise<void>;

  update: (
    payload: Partial<
      Pick<
        AdminPortalPreferences,
        'theme' | 'page_size' | 'sidebar_collapsed'
      >
    >,
  ) => Promise<void>;

  setTheme: (theme: AdminPortalTheme) => Promise<void>;
  setPageSize: (pageSize: AdminPortalPageSize) => Promise<void>;
  setSidebarCollapsed: (collapsed: boolean) => Promise<void>;

  reset: () => void;
}

export const useAdminPortalPreferencesStore =
  create<AdminPortalPreferencesState>((set) => ({
    preferences: null,
    isLoading: false,
    isSaving: false,
    error: null,

    load: async (userId) => {
      set({
        isLoading: true,
        error: null,
      });

      try {
        const preferences = await getAdminPortalPreferences();

        if (String(preferences.user_id) !== String(userId)) {
          throw new Error(
            'The server returned preferences for a different user.',
          );
        }

        set({
          preferences,
          isLoading: false,
          error: null,
        });
      } catch (error: any) {
        set({
          isLoading: false,
          error:
            error.response?.data?.message ??
            error.message ??
            'Unable to load Admin Portal preferences.',
        });

        throw error;
      }
    },

    update: async (payload) => {
      set({
        isSaving: true,
        error: null,
      });

      try {
        const updated = await updateAdminPortalPreferences(payload);

        set({
          preferences: updated,
          isSaving: false,
          error: null,
        });
      } catch (error: any) {
        set({
          isSaving: false,
          error:
            error.response?.data?.message ??
            error.message ??
            'Unable to save Admin Portal preferences.',
        });

        throw error;
      }
    },

    setTheme: async (theme) => {
      await useAdminPortalPreferencesStore
        .getState()
        .update({ theme });
    },

    setPageSize: async (page_size) => {
      await useAdminPortalPreferencesStore
        .getState()
        .update({ page_size });
    },

    setSidebarCollapsed: async (sidebar_collapsed) => {
      await useAdminPortalPreferencesStore
        .getState()
        .update({ sidebar_collapsed });
    },

    reset: () => {
      set({
        preferences: null,
        isLoading: false,
        isSaving: false,
        error: null,
      });
    },
  }));
