const store = new Map();

export function getRouteCache(key) {
  return store.get(key);
}

export function setRouteCache(key, value) {
  store.set(key, value);
}

export function hasRouteCache(key) {
  return store.has(key);
}

export function clearRouteCache(key) {
  store.delete(key);
}
