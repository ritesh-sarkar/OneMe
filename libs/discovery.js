export function escapeSearchTerm(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
