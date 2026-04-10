import { clearAuthSession, getAccessToken, getAuthSession, updateAuthSession } from './auth';

let refreshPromise = null;

export function getApiBaseUrl() {
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:5201';
}

function buildHeaders(headers = {}) {
  return {
    'Content-Type': 'application/json',
    ...headers
  };
}

function redirectToLogin() {
  if (typeof window === 'undefined') {
    return;
  }

  const base = import.meta.env.VITE_APP_BASE_NAME || '';
  const loginUrl = `${base}/login`;

  if (!window.location.pathname.endsWith('/login')) {
    window.location.assign(loginUrl);
  }
}

async function refreshAccessToken() {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const session = getAuthSession();
    const refreshToken = session?.refreshToken;

    if (!refreshToken) {
      clearAuthSession();
      redirectToLogin();
      return false;
    }

    const response = await fetch(`${getApiBaseUrl()}/api/auth/refresh`, {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify({ refreshToken })
    });

    if (!response.ok) {
      clearAuthSession();
      redirectToLogin();
      return false;
    }

    const data = await response.json();

    updateAuthSession({
      accessToken: data?.accessToken,
      refreshToken: data?.refreshToken,
      expiresAtUtc: data?.expiresAtUtc,
      refreshTokenExpiresAtUtc: data?.refreshTokenExpiresAtUtc,
      sessionId: data?.sessionId,
      user: data?.user
    });

    return true;
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

async function performRequest(path, options, auth) {
  const finalHeaders = buildHeaders(options.headers);

  if (auth) {
    const token = getAccessToken();
    if (token) {
      finalHeaders.Authorization = `Bearer ${token}`;
    }
  }

  return fetch(`${getApiBaseUrl()}${path}`, {
    ...options,
    headers: finalHeaders
  });
}

export async function apiRequest(path, options = {}) {
  const { auth = true, retryOnAuthFailure = true, ...rest } = options;

  let response = await performRequest(path, rest, auth);

  if (auth && retryOnAuthFailure && response.status === 401) {
    const refreshed = await refreshAccessToken();

    if (refreshed) {
      response = await performRequest(path, rest, auth);
    }
  }

  return response;
}
