import { apiRequest } from 'utils/api';

export function loginUser({ email, password }) {
  return apiRequest('/api/auth/login', {
    method: 'POST',
    auth: false,
    body: JSON.stringify({
      email,
      password
    })
  });
}

export function registerUser({ email, password, preferredLanguage, timeZone = 'UTC' }) {
  return apiRequest('/api/auth/register', {
    method: 'POST',
    auth: false,
    body: JSON.stringify({
      email,
      password,
      preferredLanguage,
      timeZone
    })
  });
}
