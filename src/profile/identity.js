export function profileIdentity(name) {
  const display = (name || '').trim() || 'Friend';
  return { display, initial: display.charAt(0).toUpperCase() };
}
