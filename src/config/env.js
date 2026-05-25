const trimTrailingSlash = (value) => value?.trim().replace(/\/$/, '');
const isLoopbackUrl = (value) => /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?(\/|$)/i.test(value);
const isHttpUrl = (value) => /^https?:\/\//i.test(value);

const requireEnv = (key) => {
  const value = trimTrailingSlash(import.meta.env[key]);

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
export const SOCKET_URL = trimTrailingSlash(import.meta.env.VITE_SOCKET_URL) || new URL(API_BASE_URL).origin;

if (!API_BASE_URL.endsWith('/api/v1')) {
  throw new Error('VITE_API_URL must end with /api/v1');
}

if (SOCKET_URL.endsWith('/api/v1')) {
  throw new Error('VITE_SOCKET_URL must be the backend root URL, without /api/v1');
}

if (!isHttpUrl(SOCKET_URL)) {
  throw new Error('VITE_SOCKET_URL must start with http:// or https://');
}

if (import.meta.env.PROD && isLoopbackUrl(SOCKET_URL)) {
  throw new Error(`VITE_SOCKET_URL cannot point to localhost in production: ${SOCKET_URL}`);
}
