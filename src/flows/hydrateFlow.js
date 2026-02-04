import { parseUrlState } from "../domain/queryState.js";
import { addNameRow, updateNameButtons } from "../features/names.js";
import { getRandomEligibleOptions } from "../features/texts.js";

/**
 * Hydrate name inputs from URL state.
 * @param {object} ctx
 * @param {string[]|null} names
 */
function applyNameState(ctx, names) {
  if (!names || names.length === 0) {
    return;
  }
  ctx.elements.namesContainer.innerHTML = "";
  names.forEach((value) => {
    addNameRow(ctx.nameList, value, ctx.onNameInput);
  });
  updateNameButtons(ctx.nameList);
}

/**
 * Hydrate salutation selection from URL state.
 * @param {object} ctx
 * @param {string|null} salutation
 */
function applySalutationState(ctx, salutation) {
  if (salutation !== null) {
    ctx.elements.salutationSelect.value = salutation;
  }
}

/**
 * Hydrate text selection from URL state.
 * @param {object} ctx
 * @param {string|null} textKey
 */
function applyTextState(ctx, textKey) {
  if (
    textKey !== null &&
    ctx.elements.textSelector.querySelector(
      `option[value="${CSS.escape(textKey)}"]`,
    )
  ) {
    ctx.elements.textSelector.value = textKey;
  }
}

/**
 * Hydrate pronoun selection checkboxes from URL state.
 * @param {object} ctx
 * @param {string[]|null} pronounIndexes
 */
function applyPronounState(ctx, pronounIndexes) {
  if (pronounIndexes === null) {
    return;
  }
  const selectedSet = new Set(pronounIndexes);
  ctx.elements.pronounContainer
    .querySelectorAll('input[type="checkbox"]')
    .forEach((checkbox) => {
      checkbox.checked = selectedSet.has(checkbox.value);
    });
}

/**
 * Hydrate random mode selection from URL state.
 * @param {object} ctx
 * @param {string|null} randomMode
 */
function applyRandomModeState(ctx, randomMode) {
  if (randomMode === "each") {
    ctx.elements.randomEachRadio.checked = true;
  } else if (randomMode === "single") {
    ctx.elements.randomSingleRadio.checked = true;
  }
}

/**
 * Hydrate marker toggle state from URL state.
 * @param {object} ctx
 * @param {string|null} markers
 */
function applyMarkerState(ctx, markers) {
  if (markers === "off") {
    ctx.elements.markerToggle.checked = false;
  } else if (markers === "on") {
    ctx.elements.markerToggle.checked = true;
  }
}

/**
 * Hydrate declension tab selection from URL state.
 * @param {object} ctx
 * @param {string|null} declensionTabId
 */
function applyDeclensionState(ctx, declensionTabId) {
  if (declensionTabId) {
    ctx.state.selectedDeclensionTabId = declensionTabId;
  }
}

/**
 * Apply URL query params to UI controls on initial load.
 * @param {object} ctx
 */
export function hydrateFlow(ctx) {
  const stateFromUrl = parseUrlState(window.location.search, {
    maxNames: ctx.nameList.maxNames,
  });

  applyNameState(ctx, stateFromUrl.names);
  applySalutationState(ctx, stateFromUrl.salutation);
  applyTextState(ctx, stateFromUrl.textKey);
  applyPronounState(ctx, stateFromUrl.pronounIndexes);
  applyRandomModeState(ctx, stateFromUrl.randomMode);
  applyMarkerState(ctx, stateFromUrl.markers);
  applyDeclensionState(ctx, stateFromUrl.declensionTabId);
}

/**
 * Select a random text on first load when no URL param exists.
 * @param {object} ctx
 */
export function selectRandomTextIfUnset(ctx) {
  const params = new URLSearchParams(window.location.search);
  if (params.get("text")) {
    return;
  }
  const randomOptions = getRandomEligibleOptions(ctx.elements.textSelector);
  if (randomOptions.length > 0) {
    const randomIndex = Math.floor(Math.random() * randomOptions.length);
    ctx.elements.textSelector.selectedIndex = randomOptions[randomIndex].index;
  }
}
