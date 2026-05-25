const trimTrailingSlash = (value) => value?.trim().replace(/\/$/, '');
const isLoopbackUrl = (value) => /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?(\/|$)/i.test(value);
const isHttpUrl = (value) => /^https?:\/\//i.test(value);
const PRODUCTION_API_URL = 'https://whats-app-clone-server-ksph.onrender.com/api/v1';

const requireEnv = (key) => {
  const fallback = import.meta.env.PROD && key === 'VITE_API_URL' ? PRODUCTION_API_URL : '';
  const value = trimTrailingSlash(import.meta.env[key] || fallback);

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  if (!isHttpUrl(value)) {
    throw new Error(`${key} must start with http:// or https://`);
  }

  if (import.meta.env.PROD && isLoopbackUrl(value)) {
    throw new Error(`${key} cannot point to localhost in production: ${value}`);
  }

  return value;
};

export const API_BASE_URL = requireEnv('VITE_API_URL');
const API_ORIGIN = new URL(API_BASE_URL).origin;
const configuredSocketUrl = trimTrailingSlash(import.meta.env.VITE_SOCKET_URL);
export const SOCKET_URL =
  configuredSocketUrl && !(import.meta.env.PROD && isLoopbackUrl(configuredSocketUrl))
    ? configuredSocketUrl
    : API_ORIGIN;

if (!API_BASE_URL.endsWith('/api/v1')) {
  throw new Error('VITE_API_URL must end with /api/v1');
}

if (SOCKET_URL.endsWith('/api/v1')) {
  throw new Error('VITE_SOCKET_URL must be the backend root URL, without /api/v1');
}

if (!isHttpUrl(SOCKET_URL)) {
  throw new Error('VITE_SOCKET_URL must start with http:// or https://');
}
