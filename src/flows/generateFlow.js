import { ALERT_MIN_NAME } from "../app/constants.js";
import {
  parseNames,
  normalizeNames,
  createRandomFullName,
} from "../domain/names.js";
import { getSelectedPronounSets } from "../features/pronouns.js";
import { isDeclensionText } from "../features/texts.js";
import {
  getNameInputs,
  hasAnyNameValues,
} from "../features/names.js";
import {
  resetResultsUi,
  getRandomMode,
  recordSingleSelection,
  renderOutput,
  updateRandomModeVisibility,
  wireListenButton,
} from "./renderUtils.js";
import { clearUrlParamsIfStable } from "./urlUtils.js";
 
/**
 * Render the declension view with the current selection state.
 * @param {object} ctx
 */
function renderDeclensionOutput(ctx) {
  renderOutput(ctx, {
    names: normalizeNames(parseNames(getNameInputs(ctx.nameList))),
    pronounSets: getSelectedPronounSets(ctx.elements.pronounContainer, {
      fallbackToRandom: true,
    }),
    randomMode: getRandomMode(ctx.elements),
    includeDeclensionTabs: true,
    allowTts: false,
  });
}

/**
 * Render a preview when no user-entered names are present.
 * @param {object} ctx
 */
function renderRandomPreview(ctx) {
  resetResultsUi(ctx);

  if (isDeclensionText(ctx.elements.textSelector.value)) {
    renderDeclensionOutput(ctx);
    return;
  }

  if (hasAnyNameValues(ctx.nameList)) {
    return;
  }

  const previewName = createRandomFullName(ctx.state.lastSingleNameKey);
  const renderInfo = renderOutput(ctx, {
    names: [previewName],
    pronounSets: getSelectedPronounSets(ctx.elements.pronounContainer),
    randomMode: getRandomMode(ctx.elements),
  });
  recordSingleSelection(ctx.state, renderInfo, getRandomMode(ctx.elements));
  wireListenButton(ctx, renderInfo.listenButton);
}

/**
 * Main render flow for user-driven changes.
 * @param {object} ctx
 */
export function generateFlow(ctx) {
  resetResultsUi(ctx);
  clearUrlParamsIfStable(ctx.state);

  const hasNames = hasAnyNameValues(ctx.nameList);
  updateRandomModeVisibility(ctx);

  if (isDeclensionText(ctx.elements.textSelector.value)) {
    renderDeclensionOutput(ctx);
    return;
  }

  if (!hasNames) {
    renderRandomPreview(ctx);
    return;
  }

  const parsedNames = parseNames(getNameInputs(ctx.nameList));
  if (parsedNames.length === 0) {
    alert(ALERT_MIN_NAME);
    return;
  }

  const normalizedNames = normalizeNames(parsedNames, {
    defaultNameFactory: () => createRandomFullName(ctx.state.lastSingleNameKey),
  });
  const renderInfo = renderOutput(ctx, {
    names: normalizedNames,
    pronounSets: getSelectedPronounSets(ctx.elements.pronounContainer),
    randomMode: getRandomMode(ctx.elements),
  });
  recordSingleSelection(ctx.state, renderInfo, getRandomMode(ctx.elements));
  wireListenButton(ctx, renderInfo.listenButton);
}

/**
 * Flow wrapper for rendering a random preview.
 * @param {object} ctx
 */
export function renderRandomPreviewFlow(ctx) {
  renderRandomPreview(ctx);
}
