export function parseDate(date) {
  if (date instanceof Date && !Number.isNaN(date.getTime())) {
    return date;
  }
  if (typeof date === "string") {
    if (/^\d{4}-\d{2}-\d{2}/.test(date)) {
      const parts = date.slice(0, 10).split("-").map(Number);
      const d = new Date(parts[0], parts[1] - 1, parts[2]);
      if (!Number.isNaN(d.getTime())) return d;
    }
    const d = new Date(date);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return new Date(date);
}

export function formatDate(date) {
  const d = parseDate(date);
  if (!Number.isNaN(d.getTime())) {
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }
  return String(date);
}

export function dateValue(date) {
  const d = parseDate(date);
  return Number.isNaN(d.getTime()) ? 0 : d.getTime();
}

