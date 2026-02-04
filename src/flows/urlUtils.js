/**
 * Clear query parameters from the current URL once hydration is complete.
 * Keeps the hash intact so anchor navigation still works.
 *
 * @param {{ isHydrating: boolean }} state
 */
export function clearUrlParamsIfStable(state) {
  if (state.isHydrating) {
    return;
  }
  const url = new URL(window.location.href);
  if (!url.search) {
    return;
  }
  url.search = "";
  window.history.replaceState({}, "", url.toString());
}
