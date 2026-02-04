import { $ } from "../app/dom.js";
import { renderResults } from "../features/results/resultsView.js";
import { isDeclensionText } from "../features/texts.js";
import {
  countFilledNameInputs,
} from "../features/names.js";
import { getNameKey } from "../domain/names.js";
import { LISTEN_LABEL, STOP_LISTEN_LABEL } from "../app/constants.js";

/**
 * Derive the random mode from the radio controls.
 * @param {object} elements
 * @returns {"single"|"each"}
 */
export function getRandomMode(elements) {
  return elements.randomSingleRadio.checked ? "single" : "each";
}

/**
 * Read the TTS state with a safe fallback when disabled.
 * @param {object|null} ttsController
 * @returns {{available: boolean, speaking: boolean, voice?: SpeechSynthesisVoice, utterance?: SpeechSynthesisUtterance}}
 */
export function getTtsState(ttsController) {
  return ttsController
    ? ttsController.getState()
    : { available: false, speaking: false };
}

/**
 * Trigger a layout update for the mobile icon row if present.
 * @param {object|null} mobileIconRow
 */
export function updateMobileIconLayout(mobileIconRow) {
  if (mobileIconRow) {
    mobileIconRow.update();
  }
}

/**
 * Remove any existing listen buttons from the results output and controls.
 * @param {HTMLElement} resultsOutput
 * @param {HTMLElement|null} resultsControls
 */
export function clearListenButtons(resultsOutput, resultsControls = null) {
  const containers = [resultsOutput, resultsControls].filter(Boolean);
  containers.forEach((container) => {
    container
      .querySelectorAll(".results-listen")
      .forEach((button) => button.remove());
  });
}

/**
 * Update the listen button label, icon, and visibility based on TTS state.
 * @param {{ttsController: object|null, getListenButton: function}} params
 */
export function updateListenButton({ ttsController, getListenButton }) {
  const button = getListenButton();
  if (!button) {
    return;
  }
  const { available, speaking } = getTtsState(ttsController);
  button.classList.toggle("is-hidden", !available);
  const label = speaking ? STOP_LISTEN_LABEL : LISTEN_LABEL;
  button.setAttribute("aria-label", label);
  button.setAttribute("title", label);
  const icon = $("img", button);
  if (icon) {
    icon.src = speaking ? "img/fas-stop.svg" : "img/fas-listen.svg";
  }
}

/**
 * Toggle TTS playback of the current rendered paragraph.
 * @param {{ttsController: object|null, resultsOutput: HTMLElement}} params
 */
export function toggleSpeaking({ ttsController, resultsOutput }) {
  if (!ttsController) {
    return;
  }
  const paragraph = $("p", resultsOutput);
  const text = paragraph ? paragraph.textContent.trim() : "";
  ttsController.toggle(text);
}

/**
 * Attach the listen button handler and sync its state.
 * @param {object} ctx
 * @param {HTMLElement|null} listenButton
 */
export function wireListenButton(ctx, listenButton) {
  if (!listenButton) {
    return;
  }
  listenButton.addEventListener("click", () => {
    toggleSpeaking({
      ttsController: ctx.ttsController,
      resultsOutput: ctx.elements.resultsOutput,
    });
  });
  updateListenButton({
    ttsController: ctx.ttsController,
    getListenButton: ctx.getListenButton,
  });
  updateMobileIconLayout(ctx.mobileIconRow);
}

/**
 * Reset UI state that should be cleared before rendering new results.
 * @param {object} ctx
 */
export function resetResultsUi(ctx) {
  ctx.markerDialog.close();
  if (ctx.ttsController) {
    ctx.ttsController.stop();
  }
  clearListenButtons(ctx.elements.resultsOutput, ctx.elements.resultsControls);
}

function handleDeclensionTabChange(state, tabId) {
  state.selectedDeclensionTabId = tabId;
}

/**
 * Render the current output using the shared results renderer.
 * @param {object} ctx
 * @param {object} options
 * @returns {object}
 */
export function renderOutput(ctx, options) {
  const allowTts = options.allowTts !== false;
  const ttsState = allowTts
    ? getTtsState(ctx.ttsController)
    : { available: false, speaking: false };

  return renderResults({
    resultsContainer: ctx.elements.resultsOutput,
    names: options.names,
    pronounSets: options.pronounSets,
    salutation: ctx.elements.salutationSelect.value,
    textKey: ctx.elements.textSelector.value,
    randomMode: options.randomMode,
    ttsAvailable: ttsState.available,
    ttsSpeaking: ttsState.speaking,
    declensionTabId: options.includeDeclensionTabs
      ? ctx.state.selectedDeclensionTabId
      : null,
    onDeclensionTabChange: options.includeDeclensionTabs
      ? handleDeclensionTabChange.bind(null, ctx.state)
      : null,
  });
}

/**
 * Persist the last single-mode selection to support reruns.
 * @param {object} state
 * @param {object} renderInfo
 * @param {"single"|"each"} randomMode
 */
export function recordSingleSelection(state, renderInfo, randomMode) {
  if (randomMode !== "single") {
    return;
  }
  if (renderInfo && renderInfo.pronounSet) {
    state.lastSinglePronounLabel = renderInfo.pronounSet.bezeichnung;
  }
  if (renderInfo && renderInfo.selectedName) {
    state.lastSingleNameKey = getNameKey(renderInfo.selectedName);
  }
}

/**
 * Toggle random-mode UI based on current selections and name count.
 * @param {object} ctx
 */
export function updateRandomModeVisibility(ctx) {
  if (isDeclensionText(ctx.elements.textSelector.value)) {
    ctx.elements.randomModeContainer.classList.add("is-hidden");
    ctx.elements.randomSingleRadio.checked = true;
    updateMobileIconLayout(ctx.mobileIconRow);
    return;
  }

  const selectedValues = new Set(
    Array.from(
      ctx.elements.pronounContainer.querySelectorAll(
        'input[type="checkbox"]:checked',
      ),
    ).map((checkbox) => checkbox.value),
  );
  const selectedCount = selectedValues.size;
  const filledNames = countFilledNameInputs(ctx.nameList);

  if (selectedCount > 1 || filledNames > 1) {
    ctx.elements.randomModeContainer.classList.remove("is-hidden");
    updateMobileIconLayout(ctx.mobileIconRow);
    return;
  }

  ctx.elements.randomModeContainer.classList.add("is-hidden");
  ctx.elements.randomSingleRadio.checked = true;
  updateMobileIconLayout(ctx.mobileIconRow);
}
