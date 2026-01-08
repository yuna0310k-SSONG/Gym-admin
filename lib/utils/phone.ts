export function onlyDigits(value: string): string {
  return (value ?? "").replace(/\D/g, "");
}

/**
 * Formats a Korean phone number for display.
 * - 11 digits: 01012341234 -> 010-1234-1234
 * - 10 digits: 0101231234  -> 010-123-1234
 * Falls back to original value if it can't be formatted cleanly.
 */
export function formatPhoneNumberKR(value: string): string {
  const digits = onlyDigits(value);

  if (digits.length === 11) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }

  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  // fallback: if already has formatting, keep it; otherwise show digits
  return value?.trim() ? value : digits;
}


