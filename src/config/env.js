const trimTrailingSlash = (value) => value?.trim().replace(/\/$/, '');

const requireEnv = (key, fallback) => {
  const value = trimTrailingSlash(import.meta.env[key]);

  if (value) return value;
  if (import.meta.env.DEV && fallback) return fallback;

  throw new Error(`Missing required environment variable: ${key}`);
};

export const API_BASE_URL = requireEnv('VITE_API_URL', 'http://localhost:5001/api/v1');
export const SOCKET_URL = requireEnv('VITE_SOCKET_URL', 'http://localhost:5001');
