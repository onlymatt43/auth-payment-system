const env = process.env;

function readFlag(name: string, fallback: boolean): boolean {
  const value = env[name];
  if (value === undefined) return fallback;
  return value.toLowerCase() === 'true';
}

export const featureFlags = {
  NEW_UI_ENABLED: readFlag('NEXT_PUBLIC_NEW_UI_ENABLED', true),
  NEW_UI_AUTH: readFlag('NEXT_PUBLIC_NEW_UI_AUTH', true),
  NEW_UI_PAYMENT: readFlag('NEXT_PUBLIC_NEW_UI_PAYMENT', true),
} as const;

export function isNewUiEnabled(scope: 'auth' | 'payment'): boolean {
  if (!featureFlags.NEW_UI_ENABLED) return false;
  if (scope === 'auth') return featureFlags.NEW_UI_AUTH;
  return featureFlags.NEW_UI_PAYMENT;
}
