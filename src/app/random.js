// Pick a random item that differs from the last key when possible.
export const chooseDifferent = (items, lastKey, getKey) => {
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
};
