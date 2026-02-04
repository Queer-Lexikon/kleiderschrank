import { chooseDifferent } from "../domain/random.js";
import {
  createRandomFullName,
  getNameKey,
  normalizeNames,
  parseNames,
} from "../domain/names.js";
import { getSelectedPronounSets } from "../features/pronouns.js";
import { getNameInputs, hasAnyNameValues } from "../features/names.js";
import {
  recordSingleSelection,
  renderOutput,
  resetResultsUi,
  updateRandomModeVisibility,
  wireListenButton,
} from "./renderUtils.js";
import { generateFlow } from "./generateFlow.js";

/**
 * Rerun single-mode selections, preferring a different name or pronoun set.
 * @param {object} ctx
 */
export function rerunFlow(ctx) {
  resetResultsUi(ctx);
  updateRandomModeVisibility(ctx);

  const randomModeVisible =
    !ctx.elements.randomModeContainer.classList.contains("is-hidden");
  if (!randomModeVisible || !ctx.elements.randomSingleRadio.checked) {
    generateFlow(ctx);
    return;
  }

  const nameInputs = getNameInputs(ctx.nameList);
  const hasNames = hasAnyNameValues(ctx.nameList);
  const selectedPronouns = getSelectedPronounSets(ctx.elements.pronounContainer);
  const canChangePronoun =
    selectedPronouns.length > 1 && ctx.state.lastSinglePronounLabel;

  let names = [];
  if (hasNames) {
    names = normalizeNames(parseNames(nameInputs));
  } else {
    names = [createRandomFullName(ctx.state.lastSingleNameKey)];
  }

  let pronounSets = selectedPronouns;
  if (canChangePronoun) {
    const nextPronounSet = chooseDifferent(
      selectedPronouns,
      ctx.state.lastSinglePronounLabel,
      (set) => set.bezeichnung,
    );
    pronounSets = [nextPronounSet];
  } else if (names.length > 1 && ctx.state.lastSingleNameKey) {
    const nextName = chooseDifferent(
      names,
      ctx.state.lastSingleNameKey,
      getNameKey,
    );
    names = [nextName];
  } else if (!hasNames) {
    names = [createRandomFullName(ctx.state.lastSingleNameKey)];
  }

  const renderInfo = renderOutput(ctx, {
    names,
    pronounSets,
    randomMode: "single",
  });
  recordSingleSelection(ctx.state, renderInfo, "single");
  wireListenButton(ctx, renderInfo.listenButton);
}
