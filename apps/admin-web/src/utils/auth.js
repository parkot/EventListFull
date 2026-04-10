const AUTH_STORAGE_KEY = 'eventlist-admin-auth';

function hasWindow() {
  return typeof window !== 'undefined';
}

export function getAuthSession() {
  if (!hasWindow()) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveAuthSession(session) {
  if (!hasWindow()) {
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

export function updateAuthSession(patch) {
  const current = getAuthSession();
  if (!current) {
    return;
  }

  saveAuthSession({
    ...current,
    ...patch
  });
}

export function clearAuthSession() {
  if (!hasWindow()) {
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function getAccessToken() {
  const session = getAuthSession();
  return session?.accessToken || null;
}

export function isAuthenticated() {
  return Boolean(getAccessToken());
}
