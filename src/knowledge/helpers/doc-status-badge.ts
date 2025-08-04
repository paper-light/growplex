export function docStatusBadgeClasses(status: string) {
  switch (status) {
    case "indexed":
      return "badge-success";
    case "loaded":
      return "badge-neutral";
    case "error":
      return "badge-error";
    default:
      return "badge-neutral";
  }
}
