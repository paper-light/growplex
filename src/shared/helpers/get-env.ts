const isBrowser =
  typeof window !== "undefined" && typeof localStorage !== "undefined";

export function getEnv(name: string): string {
  if (import.meta.env?.DEV || isBrowser) {
    const value = import.meta.env[name];
    if (!value) throw new Error(`Missing ${name} in import.meta.env`);
    return value;
  } else {
    const value = process.env[name];
    if (!value) throw new Error(`Missing ${name} in process.env`);
    return value;
  }
}
