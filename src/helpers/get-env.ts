const isBrowser =
  typeof window !== "undefined" && typeof localStorage !== "undefined";

export function getEnv(name: string): string {
  if (isBrowser) {
    const value = import.meta.env[name];
    if (!value) throw new Error(`Missing ${name} in import.meta.env (browser)`);
    return value;
  }

  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name} in process.env (server)`);
  return value;
}
