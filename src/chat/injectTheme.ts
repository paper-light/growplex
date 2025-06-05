export function injectTheme(properties: Record<string, string>) {
  Object.entries(properties).forEach(([key, value]) => {
    document.documentElement.style.setProperty(key, value);
  });
}
