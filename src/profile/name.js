export function isValidName(raw) {
  return typeof raw === 'string' && raw.trim().length > 0;
}
