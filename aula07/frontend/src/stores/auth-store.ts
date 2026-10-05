import { create } from 'zustand';

export const authStorageKey = 'ditado.auth';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  active?: boolean;
};

type StoredAuth = {
  user: AuthUser;
  accessToken: string;
};

type AuthState = {
  user: AuthUser | null;
  accessToken: string | null;
  setSession: (session: StoredAuth) => void;
  clearSession: () => void;
};

function readStoredAuth(): StoredAuth | null {
  const raw = window.localStorage.getItem(authStorageKey);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as StoredAuth;
  } catch {
    window.localStorage.removeItem(authStorageKey);
    return null;
  }
}

const storedAuth = readStoredAuth();

export const useAuthStore = create<AuthState>((set) => ({
  user: storedAuth?.user ?? null,
  accessToken: storedAuth?.accessToken ?? null,
  setSession: (session) => {
    window.localStorage.setItem(authStorageKey, JSON.stringify(session));
    set(session);
  },
  clearSession: () => {
    window.localStorage.removeItem(authStorageKey);
    set({
      user: null,
      accessToken: null,
    });
  },
}));
