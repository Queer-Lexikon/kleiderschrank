import {
  SHARE_COPY_PROMPT_LABEL,
  SHARE_LAST_NAME_NOTICE,
} from "../app/constants.js";
import { buildShareUrl } from "../domain/queryState.js";
import { getNameInputs } from "../features/names.js";
import {
  getShareState,
  hasProvidedLastName,
  setShareCopiedState,
} from "../features/share.js";
import { isDeclensionText } from "../features/texts.js";
import { getRandomMode } from "./renderUtils.js";

/**
 * Build the share URL and last-name warning flag.
 * @param {object} ctx
 * @returns {{shareUrl: string, includesLastName: boolean}}
 */
function buildSharePayload(ctx) {
  return {
    shareUrl: buildShareUrlForState(ctx),
    includesLastName: hasProvidedLastName(getNameInputs(ctx.nameList)),
  };
}

/**
 * Warn users when the share URL includes a last name.
 * @param {boolean} includesLastName
 */
function maybeWarnLastName(includesLastName) {
  if (includesLastName) {
    alert(SHARE_LAST_NAME_NOTICE);
  }
}

/**
 * Replace the current history entry with the share URL.
 * @param {string} shareUrl
 */
function updateHistory(shareUrl) {
  window.history.replaceState({}, "", shareUrl);
}

/**
 * Build a shareable URL that represents the current UI state.
 * @param {object} ctx
 * @returns {string}
 */
export function buildShareUrlForState(ctx) {
  const shareState = getShareState({
    nameInputs: getNameInputs(ctx.nameList),
    salutationSelect: ctx.elements.salutationSelect,
    textSelector: ctx.elements.textSelector,
    pronounContainer: ctx.elements.pronounContainer,
    randomMode: getRandomMode(ctx.elements),
    markerToggle: ctx.elements.markerToggle,
    declensionTabId: ctx.state.selectedDeclensionTabId,
    isDeclensionText,
  });
  return buildShareUrl({
    baseUrl: window.location.href,
    ...shareState,
  });
}

/**
 * Open the native share sheet if supported.
 * @param {object} ctx
 * @returns {Promise<void>}
 */
export async function shareSheetFlow(ctx) {
  try {
    const { shareUrl, includesLastName } = buildSharePayload(ctx);
    maybeWarnLastName(includesLastName);
    updateHistory(shareUrl);
    await navigator.share({
      title: document.title,
      url: shareUrl,
    });
  } catch (error) {
    void error;
  }
}

/**
 * Copy a shareable URL to the clipboard, with a prompt fallback.
 * @param {object} ctx
 * @returns {Promise<void>}
 */
export async function shareCopyFlow(ctx) {
  const { shareUrl, includesLastName } = buildSharePayload(ctx);
  try {
    maybeWarnLastName(includesLastName);
    updateHistory(shareUrl);
    await navigator.clipboard.writeText(shareUrl);
    setShareCopiedState(ctx.elements.shareButton);
  } catch (error) {
    maybeWarnLastName(includesLastName);
    updateHistory(shareUrl);
    window.prompt(SHARE_COPY_PROMPT_LABEL, shareUrl);
  }
}
