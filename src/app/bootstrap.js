import { createElements } from "./elements.js";
import { createState } from "./state.js";
import { $ } from "./dom.js";
import { populatePronounCheckboxes } from "../features/pronouns.js";
import { populateTextSelector } from "../features/texts.js";
import { createTtsController } from "../features/tts.js";
import { createMobileIconRow } from "../features/results/mobileIconRow.js";
import { initMarkerDialog } from "../features/results/markerDialog.js";
import {
  createNameListState,
  ensureNameRows,
  hasAnyNameValues,
} from "../features/names.js";
import { applyShareAvailability } from "../features/share.js";
import { hydrateFlow, selectRandomTextIfUnset } from "../flows/hydrateFlow.js";
import { generateFlow, renderRandomPreviewFlow } from "../flows/generateFlow.js";
import { rerunFlow } from "../flows/rerunFlow.js";
import { randomTextFlow } from "../flows/randomTextFlow.js";
import { shareCopyFlow, shareSheetFlow } from "../flows/shareFlow.js";
import { updateMarkerStyle } from "../flows/markerFlow.js";
import {
  updateListenButton,
  updateMobileIconLayout,
  updateRandomModeVisibility,
} from "../flows/renderUtils.js";

/**
 * Locate the current listen button in results output or controls.
 * @param {HTMLElement} resultsOutput
 * @param {HTMLElement|null} resultsControls
 * @returns {HTMLElement|null}
 */
function getListenButton(resultsOutput, resultsControls) {
  return (
    $(".results-listen", resultsOutput) ||
    (resultsControls ? $(".results-listen", resultsControls) : null)
  );
}

/**
 * Locate the results heading row.
 * @param {HTMLElement} resultsOutput
 * @returns {HTMLElement|null}
 */
function getHeadingRow(resultsOutput) {
  return $(".results-heading", resultsOutput);
}

/**
 * Locate the select row for text selection controls.
 * @returns {HTMLElement|null}
 */
function getSelectRow() {
  return $(".select-row");
}

/**
 * Locate the random mode row for radio buttons.
 * @returns {HTMLElement|null}
 */
function getRandomModeRow() {
  return $(".random-mode-row");
}

/**
 * Handle pronoun checkbox changes.
 * @param {object} ctx
 */
function handlePronounChange(ctx) {
  updateRandomModeVisibility(ctx);
  generateFlow(ctx);
}

/**
 * Sync listen button and mobile icon row on TTS state changes.
 * @param {object} ctx
 */
function handleTtsStatusChange(ctx) {
  updateListenButton({
    ttsController: ctx.ttsController,
    getListenButton: ctx.getListenButton,
  });
  updateMobileIconLayout(ctx.mobileIconRow);
}

/**
 * Re-render when name inputs change.
 * @param {object} ctx
 */
function handleNameInput(ctx) {
  generateFlow(ctx);
}

/**
 * Attach DOM event handlers.
 * @param {object} ctx
 */
function wireEvents(ctx) {
  ctx.elements.randomTextButton.addEventListener(
    "click",
    randomTextFlow.bind(null, ctx),
  );
  ctx.elements.shareSheetButton.addEventListener(
    "click",
    shareSheetFlow.bind(null, ctx),
  );
  ctx.elements.shareButton.addEventListener(
    "click",
    shareCopyFlow.bind(null, ctx),
  );
  ctx.elements.markerToggle.addEventListener(
    "change",
    updateMarkerStyle.bind(null, ctx),
  );

  ctx.elements.salutationSelect.addEventListener(
    "change",
    generateFlow.bind(null, ctx),
  );
  ctx.elements.textSelector.addEventListener(
    "change",
    generateFlow.bind(null, ctx),
  );
  ctx.elements.pronounContainer.addEventListener(
    "change",
    handlePronounChange.bind(null, ctx),
  );
  ctx.elements.randomSingleRadio.addEventListener(
    "change",
    generateFlow.bind(null, ctx),
  );
  ctx.elements.randomEachRadio.addEventListener(
    "change",
    generateFlow.bind(null, ctx),
  );
  ctx.elements.rerunButton.addEventListener(
    "click",
    rerunFlow.bind(null, ctx),
  );
}

/**
 * Initialize the application on DOMContentLoaded.
 */
function init() {
  const elements = createElements();
  const state = createState();
  const nameList = createNameListState({ container: elements.namesContainer });
  const mobileMediaQuery = window.matchMedia("(max-width: 60rem)");

  const ctx = {
    elements,
    state,
    nameList,
    markerDialog: null,
    ttsController: null,
    mobileIconRow: null,
    getListenButton: getListenButton.bind(
      null,
      elements.resultsOutput,
      elements.resultsControls,
    ),
    getHeadingRow: getHeadingRow.bind(null, elements.resultsOutput),
    onNameInput: null,
  };

  populateTextSelector(elements.textSelector);
  populatePronounCheckboxes(elements.pronounContainer);

  ctx.markerDialog = initMarkerDialog({
    dialog: elements.markerDialog,
    dialogBody: elements.markerDialogBody,
    dialogTitle: elements.markerDialogTitle,
    resultsOutput: elements.resultsOutput,
  });

  ctx.onNameInput = handleNameInput.bind(null, ctx);
  ensureNameRows(nameList, ctx.onNameInput);
  hydrateFlow(ctx);
  updateRandomModeVisibility(ctx);
  updateMarkerStyle(ctx);
  selectRandomTextIfUnset(ctx);
  renderRandomPreviewFlow(ctx);

  ctx.ttsController = createTtsController({
    onStatusChange: handleTtsStatusChange.bind(null, ctx),
  });
  ctx.ttsController.init();

  ctx.mobileIconRow = createMobileIconRow({
    mobileQuery: mobileMediaQuery,
    resultsControls: elements.resultsControls,
    randomModeContainer: elements.randomModeContainer,
    randomTextButton: elements.randomTextButton,
    rerunButton: elements.rerunButton,
    getListenButton: ctx.getListenButton,
    getHeadingRow: ctx.getHeadingRow,
    getSelectRow,
    getRandomModeRow,
  });
  ctx.mobileIconRow.attach();

  wireEvents(ctx);
  applyShareAvailability(elements.shareSheetButton, elements.shareButton);

  if (hasAnyNameValues(nameList)) {
    generateFlow(ctx);
  }
  updateMobileIconLayout(ctx.mobileIconRow);
  state.isHydrating = false;
}

window.addEventListener("DOMContentLoaded", init);
