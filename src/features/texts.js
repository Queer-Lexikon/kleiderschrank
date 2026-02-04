import SampleTexts from "../../data/SampleTexts.js";

/**
 * Return the sample text entry for the given key.
 * @param {string|null} textKey
 * @returns {object|null}
 */
export function getSampleTextEntry(textKey) {
  return textKey ? SampleTexts[textKey] || null : null;
}

/**
 * Check whether the selected text uses the declension view.
 * @param {string|null} textKey
 * @returns {boolean}
 */
export function isDeclensionText(textKey) {
  const entry = getSampleTextEntry(textKey);
  return entry?.type === "declensions";
}

/**
 * Determine whether a text entry is eligible for random selection.
 * @param {object|null} entry
 * @returns {boolean}
 */
export function isRandomEligibleEntry(entry) {
  return !(entry && entry.random === false);
}

/**
 * Fill the text selector options from the sample texts.
 * @param {HTMLSelectElement} select
 */
export function populateTextSelector(select) {
  Object.entries(SampleTexts).forEach(([key, entry]) => {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = entry.title || key;
    if (!isRandomEligibleEntry(entry)) {
      option.dataset.randomEligible = "false";
    }
    select.appendChild(option);
  });
}

/**
 * Return selector options eligible for random text selection.
 * @param {HTMLSelectElement} select
 * @returns {HTMLOptionElement[]}
 */
export function getRandomEligibleOptions(select) {
  return Array.from(select.options).filter(
    (option) => option.dataset.randomEligible !== "false",
  );
}
