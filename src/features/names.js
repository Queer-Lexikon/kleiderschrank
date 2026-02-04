import { $, $$ } from "../app/dom.js";
import {
  NAME_PLACEHOLDER,
  REMOVE_NAME_LABEL,
  MAX_NAMES,
} from "../app/constants.js";

/**
 * Create a state container for name list operations.
 * @param {{container: HTMLElement, maxNames?: number}} params
 * @returns {{container: HTMLElement, maxNames: number}}
 */
export function createNameListState({ container, maxNames = MAX_NAMES }) {
  return { container, maxNames };
}

/**
 * Return all name input elements within the list.
 * @param {{container: HTMLElement}} nameList
 * @returns {HTMLInputElement[]}
 */
export function getNameInputs(nameList) {
  return $$(".name-input", nameList.container);
}

/**
 * Return all name row elements within the list.
 * @param {{container: HTMLElement}} nameList
 * @returns {HTMLElement[]}
 */
export function getNameRows(nameList) {
  return $$(".name-row", nameList.container);
}

/**
 * Count how many name inputs currently have values.
 * @param {{container: HTMLElement}} nameList
 * @returns {number}
 */
export function countFilledNameInputs(nameList) {
  return getNameInputs(nameList).filter(
    (input) => input.value.trim().length > 0,
  ).length;
}

/**
 * Check whether any name input has a non-empty value.
 * @param {{container: HTMLElement}} nameList
 * @returns {boolean}
 */
export function hasAnyNameValues(nameList) {
  return countFilledNameInputs(nameList) > 0;
}

/**
 * Keep the primary label bound to the first visible name input.
 * @param {{container: HTMLElement}} nameList
 */
export function syncNameLabelTarget(nameList) {
  const inputs = getNameInputs(nameList);
  inputs.forEach((input, index) => {
    if (index === 0) {
      input.id = "names";
      input.removeAttribute("aria-label");
      return;
    }
    if (input.id === "names") {
      input.removeAttribute("id");
    }
    input.setAttribute("aria-label", "Weiterer Name");
  });
}

/**
 * Toggle remove buttons and sync accessible labels for name rows.
 * @param {{container: HTMLElement}} nameList
 */
export function updateNameButtons(nameList) {
  const rows = getNameRows(nameList);
  rows.forEach((row) => {
    const removeButton = $(".remove-name", row);
    if (removeButton) {
      removeButton.classList.toggle("is-hidden", rows.length === 1);
    }
  });

  syncNameLabelTarget(nameList);
}

/**
 * Remove a name row and restore focus to a nearby input.
 * @param {{container: HTMLElement}} nameList
 * @param {HTMLElement} row
 * @param {HTMLInputElement} input
 * @param {Function} onChange
 */
export function removeNameRow(nameList, row, input, onChange) {
  const inputsBefore = getNameInputs(nameList);
  const currentIndex = inputsBefore.indexOf(input);
  row.remove();
  updateNameButtons(nameList);
  if (onChange) {
    onChange();
  }
  const inputsAfter = getNameInputs(nameList);
  if (inputsAfter.length === 0) {
    return;
  }
  const nextIndex = Math.min(currentIndex, inputsAfter.length - 1);
  inputsAfter[nextIndex].focus();
}

/**
 * Notify onChange when name input changes.
 * @param {Function} onChange
 */
function handleNameInput(onChange) {
  if (onChange) {
    onChange();
  }
}

/**
 * Handle keyboard shortcuts for the name input.
 * Enter adds a row. Backspace removes an empty row when possible.
 * @param {object} nameList
 * @param {HTMLElement} row
 * @param {HTMLInputElement} input
 * @param {Function} onChange
 * @param {KeyboardEvent} event
 */
function handleNameKeydown(nameList, row, input, onChange, event) {
  if (event.key === "Enter") {
    event.preventDefault();
    addNameRow(nameList, "", onChange);
    return;
  }
  if (event.key !== "Backspace") {
    return;
  }
  if (input.value.trim().length > 0) {
    return;
  }
  if (getNameRows(nameList).length === 1) {
    return;
  }
  event.preventDefault();
  removeNameRow(nameList, row, input, onChange);
}

/**
 * Remove a name row when the remove button is clicked.
 * @param {object} nameList
 * @param {HTMLElement} row
 * @param {HTMLInputElement} input
 * @param {Function} onChange
 */
function handleRemoveClick(nameList, row, input, onChange) {
  removeNameRow(nameList, row, input, onChange);
}

/**
 * Build a name row node with input and remove button.
 * @param {object} nameList
 * @param {string} value
 * @param {Function} onChange
 * @returns {HTMLElement}
 */
export function createNameRow(nameList, value = "", onChange) {
  const row = document.createElement("div");
  row.className = "name-row";

  const input = document.createElement("input");
  input.type = "text";
  input.className = "name-input";
  input.placeholder = NAME_PLACEHOLDER;
  input.value = value;
  input.addEventListener("input", handleNameInput.bind(null, onChange));
  input.addEventListener(
    "keydown",
    handleNameKeydown.bind(null, nameList, row, input, onChange),
  );

  const removeButton = document.createElement("button");
  removeButton.type = "button";
  removeButton.className = "icon-button remove-name";
  removeButton.setAttribute("aria-label", REMOVE_NAME_LABEL);
  removeButton.setAttribute("title", REMOVE_NAME_LABEL);
  removeButton.innerHTML =
    '<img src="img/fas-minus.svg" alt="" aria-hidden="true" />';
  removeButton.addEventListener(
    "click",
    handleRemoveClick.bind(null, nameList, row, input, onChange),
  );

  row.appendChild(input);
  row.appendChild(removeButton);

  return row;
}

/**
 * Append a name row when under the max limit.
 * @param {object} nameList
 * @param {string} value
 * @param {Function} onChange
 * @returns {HTMLElement|null}
 */
export function addNameRow(nameList, value = "", onChange) {
  if (getNameRows(nameList).length >= nameList.maxNames) {
    return null;
  }
  const row = createNameRow(nameList, value, onChange);
  nameList.container.appendChild(row);
  updateNameButtons(nameList);
  const newInput = $(".name-input", row);
  if (newInput) {
    newInput.focus();
  }
  return row;
}

/**
 * Ensure at least one name row exists and rebind change handlers.
 * @param {object} nameList
 * @param {Function} onChange
 */
export function ensureNameRows(nameList, onChange) {
  if (getNameRows(nameList).length > 0) {
    return;
  }
  const existingInputs = getNameInputs(nameList);
  if (existingInputs.length === 0) {
    addNameRow(nameList, "", onChange);
    return;
  }
  const existingValue = existingInputs[0].value;
  nameList.container.innerHTML = "";
  addNameRow(nameList, existingValue, onChange);
}
