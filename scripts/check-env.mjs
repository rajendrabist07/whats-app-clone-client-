import { existsSync, readFileSync } from 'node:fs';

const env = {
  ...readDotEnv('.env'),
  ...process.env,
};

const isVercel = env.VERCEL === '1';
const loopbackPattern = /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?(\/|$)/i;
const PRODUCTION_API_URL = 'https://whats-app-clone-server-ksph.onrender.com/api/v1';

if (isVercel) {
  const apiUrl = env.VITE_API_URL || PRODUCTION_API_URL;

  if (!env.VITE_API_URL) {
    console.warn(`VITE_API_URL is not set. Using default production API URL: ${PRODUCTION_API_URL}`);
  }

  assertProductionUrl('VITE_API_URL', apiUrl, { required: true, mustIncludeApiBase: true });
  assertProductionSocketUrl(env.VITE_SOCKET_URL);
}

function assertProductionUrl(key, value, { required, mustIncludeApiBase = false } = {}) {
  if (!value) {
    if (required) {
      throw new Error(`${key} is required for Vercel deployment`);
    }
    return;
  }

  if (loopbackPattern.test(value)) {
    throw new Error(`${key} cannot point to localhost during Vercel deployment: ${value}`);
  }

  if (!value.startsWith('https://')) {
    throw new Error(`${key} must use https:// in production: ${value}`);
  }

  if (mustIncludeApiBase && !value.replace(/\/$/, '').endsWith('/api/v1')) {
    throw new Error(`${key} must end with /api/v1: ${value}`);
  }
}

function assertProductionSocketUrl(value) {
  if (!value) return;

  if (loopbackPattern.test(value)) {
    console.warn(`VITE_SOCKET_URL points to localhost and will be ignored in production: ${value}`);
    return;
  }

  assertProductionUrl('VITE_SOCKET_URL', value, { required: false });
}

function readDotEnv(path) {
  if (!existsSync(path)) return {};

  return Object.fromEntries(
    readFileSync(path, 'utf8')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'))
      .map((line) => {
        const separatorIndex = line.indexOf('=');
        if (separatorIndex === -1) return [line, ''];

        return [
          line.slice(0, separatorIndex),
          line.slice(separatorIndex + 1).replace(/^['"]|['"]$/g, ''),
        ];
      })
  );
}
