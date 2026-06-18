export function profileIdentity(name) {
  const display = (name || '').trim() || 'Friend';
  return { display, initial: display.charAt(0).toUpperCase() };
}

export function sanitizeName(input) {
  const trimmed = (input || '').trim();
  if (!trimmed) return null;
  return trimmed.slice(0, 40);
}
