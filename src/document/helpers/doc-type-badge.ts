export function docTypeBadgeClasses(type: string) {
  switch (type) {
    case "file":
      return "badge-info";
    case "webPage":
      return "badge-primary";
    case "manual":
      return "badge-secondary";
    default:
      return "badge-neutral";
  }
}
