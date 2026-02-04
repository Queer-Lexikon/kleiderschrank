// Pick a random item that differs from the last key when possible.
/**
 * Choose a random item, preferring one that differs from `lastKey`.
 * @template T
 * @param {T[]} items
 * @param {string|null} lastKey
 * @param {(item: T) => string} getKey
 * @returns {T}
 */
export function chooseDifferent(items, lastKey, getKey) {
  if (items.length <= 1) {
    return items[0];
  }

  let candidate = items[Math.floor(Math.random() * items.length)];
  if (!lastKey) {
    return candidate;
  }

  let attempts = 0;
  while (getKey(candidate) === lastKey && attempts < 20) {
    candidate = items[Math.floor(Math.random() * items.length)];
    attempts += 1;
  }

  return candidate;
}
