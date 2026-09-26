export function normalizeApiError(error) {
  const detail = error?.detail;
  if (Array.isArray(detail)) {
    return detail.map((item) => {
      const field = item.loc?.at(-1)?.toString().replaceAll("_", " ") || "Request";
      return `${field.charAt(0).toUpperCase()}${field.slice(1)}: ${item.msg}`;
    }).join(" ");
  }
  if (typeof detail === "string") return detail;
  if (typeof error?.message === "string") return error.message;
  return "Something went wrong. Please try again.";
}
