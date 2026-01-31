import PronounSet from "./PronounSet.js";
import PronounTool from "./PronounTool.js";

import pronounSetsData from "../data/pronounSets.js";
import SampleTexts from "../data/SampleTexts.js";
import lastNames from "../data/lastNames.js";

const allPronounSets = pronounSetsData.map((def) => new PronounSet(def));

const tool = new PronounTool(allPronounSets);

/**
 * Create option elements for all sample texts in the selector.
 *
 * @param {HTMLSelectElement} select The select element to populate.
 */
function populateTextSelector(select) {
  Object.keys(SampleTexts).forEach((key) => {
    const option = document.createElement("option");
    // Use the internal key as the value and the human‑readable title
    // from the sample text object as the visible text.  This makes
    // selection more intuitive.
    option.value = key;
    const entry = SampleTexts[key];
    option.textContent = entry.title || key;
    select.appendChild(option);
  });
}

/**
 * Create checkbox inputs for each pronoun set.
 *
 * @param {HTMLElement} container The element that will contain the checkboxes.
 */
function populatePronounCheckboxes(container) {
  allPronounSets.forEach((set, index) => {
    const id = `pronoun_${index}`;
    const label = document.createElement("label");
    const checkbox = document.createElement("input");

    checkbox.type = "checkbox";
    checkbox.id = id;
    checkbox.value = index.toString();
    label.appendChild(checkbox);

    const textNode = document.createTextNode(" " + set.bezeichnung);
    label.appendChild(textNode);

    const div = document.createElement("div");
    div.appendChild(label);
    container.appendChild(div);
  });
}

/**
 * Read user input, perform substitutions and display results.
 */
function handleGenerate() {
  const namesInput = document.getElementById("names");
  const salutationSelect = document.getElementById("salutation");
  const textSelector = document.getElementById("textSelector");
  const randomSingleRadio = document.getElementById("randomSingle");
  const resultsContainer = document.getElementById("results");

  // Parse one or more full names separated by commas. Each entry may
  // include a first and last name separated by whitespace.
  const rawNames = namesInput.value
    .split(",")
    .map((n) => n.trim())
    .filter((n) => n);

  const parsedNames = rawNames.map((name) => {
    const parts = name.split(/\s+/).filter((p) => p);

    if (parts.length > 1) {
      const lastName = parts.pop();
      return { firstName: parts.join(" "), lastName };
    }

    // Single word: keep last name empty; add a fallback for cases that require one.
    const randomIdx = Math.floor(Math.random() * lastNames.length);
    const fallbackLastName = lastNames[randomIdx] || "";
    return { firstName: parts[0], lastName: "", fallbackLastName };
  });

  const salutation = salutationSelect.value;

  // Determine selected pronoun sets by collecting checked boxes. When
  // none are selected, fall back to the "Keine Pronomen" set.
  const selectedIndexes = Array.from(
    document.querySelectorAll("#pronounContainer input[type=checkbox]")
  )
    .filter((box) => box.checked)
    .map((box) => parseInt(box.value, 10));

  let selectedSets = [];

  if (selectedIndexes.length > 0) {
    selectedSets = selectedIndexes.map((i) => allPronounSets[i]);
  } else {
    // Find the "Keine Pronomen" set in the available pronoun sets.
    const noneSet = allPronounSets.find(
      (set) => set.bezeichnung === "Keine Pronomen"
    );

    // Default to the first set if something goes terribly wrong
    selectedSets = [noneSet || allPronounSets[0]];
  }

  // Require at least one name
  if (parsedNames.length === 0) {
    alert("Bitte gib mindestens einen Namen ein.");
    return;
  }

  const selectedTextKey = textSelector.value;
  const selectedEntry = SampleTexts[selectedTextKey];
  const text = selectedEntry && selectedEntry.text ? selectedEntry.text : "";
  const randomMode = randomSingleRadio.checked ? "single" : "each";

  // Clear previous results
  resultsContainer.innerHTML = "";
  const peopleWithSalutation = parsedNames.map((person) => ({
    firstName: person.firstName,
    lastName: person.lastName,
    fallbackLastName: person.fallbackLastName || "",
    salutation,
  }));

  // Render a single text with randomly chosen names for each token
  const result = tool.render(
    text,
    peopleWithSalutation,
    selectedSets,
    randomMode
  );

  const h3 = document.createElement("h3");
  h3.textContent =
    selectedEntry && selectedEntry.title ? selectedEntry.title : "Ausgabe";

  if (randomMode === "single" && result.pronounSet) {
    h3.textContent += " – " + result.pronounSet.bezeichnung;
  }

  resultsContainer.appendChild(h3);

  const paragraph = document.createElement("p");
  paragraph.innerHTML = result.html;
  resultsContainer.appendChild(paragraph);
}

window.addEventListener("DOMContentLoaded", () => {
  populateTextSelector(document.getElementById("textSelector"));
  populatePronounCheckboxes(document.getElementById("pronounContainer"));
  document
    .getElementById("generateButton")
    .addEventListener("click", handleGenerate);
});
