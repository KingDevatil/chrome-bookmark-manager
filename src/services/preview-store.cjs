const KEY = 'restore_previews_v1';
const TTL = 24 * 60 * 60 * 1000;
async function fingerprint(value) {
  const text = JSON.stringify(value, (_key, item) => item && typeof item === 'object' && !Array.isArray(item)
    ? Object.fromEntries(Object.keys(item).sort().map(key => [key, item[key]])) : item);
  return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))), b => b.toString(16).padStart(2, '0')).join('');
}
function previewStore(api) {
  // Local fallback is for browsers without session storage, not quota failures.
  const area = api.storage.session || api.storage.local;
  async function read() {
    const saved = (await area.get(KEY))[KEY] || {};
    const entries = Object.fromEntries(Object.entries(saved).filter(([, value]) => value && Number.isFinite(value.time) && Date.now() - value.time < TTL));
    if (Object.keys(entries).length !== Object.keys(saved).length) await area.set({ [KEY]: entries });
    return entries;
  }
  return {
    async get(token) { return (await read())[token]; },
    async put(token, value) {
      const entries = await read(); entries[token] = value;
      const newest = Object.entries(entries).sort((a,b) => b[1].time - a[1].time).slice(0,4);
      await area.set({ [KEY]: Object.fromEntries(newest) });
    }
  };
}
module.exports = { previewStore, fingerprint };
