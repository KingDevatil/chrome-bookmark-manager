/* One Promise-based boundary. Legacy callback UI callers are supported during migration. */
function createAPI(native) {
  const asyncNamespaces = new Set(['bookmarks', 'storage.local', 'history', 'tabs', 'alarms', 'runtime', 'sidePanel', 'sidebarAction']);
  const syncMethods = new Set(['getURL', 'getManifest', 'connect']);
  let callbackError;
  const cache = new Map();
  function wrap(object, path = '') {
    if (!object) return object;
    if (cache.has(object)) return cache.get(object);
    const proxy = new Proxy(object, {
      get(target, key) {
        if (path === 'runtime' && key === 'lastError') return callbackError || target.lastError;
        const value = target[key];
        if (typeof value === 'function') {
          if (!asyncNamespaces.has(path) || syncMethods.has(key)) return value.bind(target);
          return (...args) => {
            const callback = typeof args.at(-1) === 'function' ? args.pop() : null;
            const promise = Promise.resolve().then(() => value.apply(target, args));
            if (!callback) return promise;
            promise.then(result => callback(result), error => {
              callbackError = error;
              try { callback(undefined); } finally { callbackError = undefined; }
            });
          };
        }
        if (value && typeof value === 'object') return wrap(value, path ? `${path}.${String(key)}` : String(key));
        return value;
      }
    });
    cache.set(object, proxy);
    return proxy;
  }
  return wrap(native);
}
module.exports = { createAPI };
