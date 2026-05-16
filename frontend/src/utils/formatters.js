// MySQL returns datetimes as "YYYY-MM-DD HH:MM:SS" with no timezone marker.
// Appending "Z" after normalising the separator makes the browser treat the
// value as UTC, so toLocale* methods then convert to the user's local time.
const parseUtc = (dateStr) => {
  if (!dateStr) return null;
  const s = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(dateStr)
    ? dateStr.replace(" ", "T") + "Z"
    : dateStr;
  return new Date(s);
};

export const formatDate = (dateStr, options = {}) => {
  if (!dateStr) return "—";
  return parseUtc(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...options,
  });
};

export const formatDateTime = (dateStr) => {
  if (!dateStr) return "—";
  return parseUtc(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatCurrency = (amount, symbol = "$") => {
  if (amount === null || amount === undefined) return "—";
  const num = Number(amount);
  return `${symbol}${num.toLocaleString("en-US", {
    minimumFractionDigits: num % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
};

export const formatNumber = (amount, decimals = 2) => {
  if (amount === null || amount === undefined) return "—";
  const num = Number(amount);
  return num.toLocaleString("en-US", {
    minimumFractionDigits: num % 1 === 0 ? 0 : decimals,
    maximumFractionDigits: decimals,
  });
};

export const capitalize = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1) : "";

export const truncate = (str, length = 50) =>
  str?.length > length ? `${str.substring(0, length)}…` : str;

export const formatPercent = (value) =>
  `${Number(value).toFixed(1)}%`;

export const getInitials = (firstName, lastName) =>
  `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase();