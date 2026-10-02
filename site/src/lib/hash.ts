// Deterministic djb2 hash (base36) — used to compare build-time snapshot
// vs. live API payloads at runtime. Stable across server/client.
export function hashJson(value: unknown): string {
  const s = JSON.stringify(value);
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  }
  return (h >>> 0).toString(36);
}
