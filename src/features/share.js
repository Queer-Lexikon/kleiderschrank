import { $$ } from "../app/dom.js";
import {
  SHARE_COPY_BUTTON_LABEL,
  SHARE_COPY_SUCCESS,
} from "../app/constants.js";

/**
 * Detect whether any input contains a last name.
 * @param {HTMLInputElement[]} nameInputs
 * @returns {boolean}
 */
export function hasProvidedLastName(nameInputs) {
  return nameInputs.some((input) =>
    input.value
      .split(",")
      .some((value) => value.trim().split(/\s+/).filter(Boolean).length > 1),
  );
}

/**
 * Build the share-state object from the current UI.
 * @param {object} params
 * @returns {object}
 */
export function getShareState({
  nameInputs,
  salutationSelect,
  textSelector,
  pronounContainer,
  randomMode,
  markerToggle,
  declensionTabId,
  isDeclensionText,
}) {
  return {
    names: nameInputs.map((input) => input.value.trim()),
    salutation: salutationSelect.value,
    textKey: textSelector.value,
    pronouns: $$('input[type="checkbox"]:checked', pronounContainer).map(
      (box) => box.value,
    ),
    randomMode,
    markers: markerToggle.checked ? "on" : "off",
    declensionTabId:
      isDeclensionText(textSelector.value) && declensionTabId
        ? declensionTabId
        : null,
  };
}

/**
 * Adjust share UI based on navigator.share support.
 * @param {HTMLElement} shareSheetButton
 * @param {HTMLElement} shareButton
 */
export function applyShareAvailability(shareSheetButton, shareButton) {
  const shareAvailable = Boolean(navigator.share);
  if (shareAvailable) {
    shareSheetButton.classList.remove("is-hidden");
    shareSheetButton.classList.add("is-full");
    shareButton.classList.add("is-hidden");
    shareButton.classList.remove("is-full");
    return;
  }
  shareSheetButton.classList.add("is-hidden");
  shareSheetButton.classList.remove("is-full");
  shareButton.classList.remove("is-hidden");
  shareButton.classList.add("is-full");
}

/**
 * Return the label node for a share button, if present.
 * @param {HTMLElement} shareButton
 * @returns {HTMLElement|null}
 */
function getShareButtonLabel(shareButton) {
  return shareButton.querySelector(".share-button__label");
}

/**
 * Temporarily show the "copied" label on the share button.
 * @param {HTMLButtonElement} shareButton
 * @param {number} timeoutMs
 */
export function setShareCopiedState(shareButton, timeoutMs = 1500) {
  const label = getShareButtonLabel(shareButton);
  const setLabel = (text) => {
    if (label) {
      label.textContent = text;
      return;
    }
    shareButton.textContent = text;
  };

  setLabel(SHARE_COPY_SUCCESS);
  shareButton.classList.add("is-copied");
  setTimeout(() => {
    setLabel(SHARE_COPY_BUTTON_LABEL);
    shareButton.classList.remove("is-copied");
  }, timeoutMs);
}
