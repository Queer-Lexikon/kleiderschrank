/**
 * Build the initial in-memory UI state.
 * @returns {object}
 */
export function createState() {
  return {
    lastSinglePronounLabel: null,
    lastSingleNameKey: null,
    selectedDeclensionTabId: null,
    isHydrating: true,
  };
}
