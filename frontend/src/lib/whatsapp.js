export function composeWhatsAppMessage(opening, details) {
  const lines = [
    opening.trim(),
    "",
    `Name: ${details.name || "Not provided"}`,
    `Project type: ${details.projectType || "Not selected"}`,
    `Budget: ${details.budget || "Not selected"}`,
    `Brief: ${details.brief || "I would like to discuss the details."}`,
  ];
  return lines.join("\n");
}

export function buildWhatsAppUrl(number, message) {
  return `https://wa.me/${number.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
}
