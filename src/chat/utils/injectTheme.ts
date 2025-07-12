export function injectTheme(
  properties: Record<string, string>,
  root: HTMLElement | null
) {
  if (!root) return;

  Object.entries(properties).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
}
