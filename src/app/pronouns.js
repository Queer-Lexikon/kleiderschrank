import PronounSet from "../PronounSet.js";
import pronounSetsData from "../../data/pronounSets.js";
import { NONE_LABEL } from "./constants.js";

// Preload all pronoun sets from data for reuse across UI.
export const allPronounSets = pronounSetsData.map((def) => new PronounSet(def));

// Render the checkbox list for pronoun sets.
export const populatePronounCheckboxes = (container) => {
  const previewCount = 6;
  const primaryList = document.createElement("div");
  primaryList.className = "pronoun-list pronoun-list--primary";

  const extraList = document.createElement("div");
  extraList.className = "pronoun-list pronoun-list--extra is-collapsed";
  extraList.id = "pronounExtraList";

  allPronounSets.forEach((set, index) => {
    const id = `pronoun_${index}`;
    const label = document.createElement("label");
    const checkbox = document.createElement("input");

    checkbox.type = "checkbox";
    checkbox.id = id;
    checkbox.value = index.toString();
    label.appendChild(checkbox);

    const textNode = document.createTextNode(` ${set.bezeichnung}`);
    label.appendChild(textNode);

    const row = document.createElement("div");
    row.className = "pronoun-item";
    row.appendChild(label);

    if (index < previewCount) {
      primaryList.appendChild(row);
    } else {
      extraList.appendChild(row);
    }
  });

  container.appendChild(primaryList);

  if (allPronounSets.length > previewCount) {
    const toggleButton = document.createElement("button");
    toggleButton.type = "button";
    toggleButton.className = "pronoun-toggle";
    toggleButton.setAttribute("aria-expanded", "false");
    toggleButton.setAttribute("aria-controls", "pronounExtraList");
    toggleButton.textContent = "Weitere Pronomen anzeigen";
    toggleButton.addEventListener("click", () => {
      const isCollapsed = extraList.classList.toggle("is-collapsed");
      toggleButton.setAttribute("aria-expanded", (!isCollapsed).toString());
      toggleButton.textContent = isCollapsed
        ? "Weitere Pronomen anzeigen"
        : "Weniger Pronomen anzeigen";
    });

    container.appendChild(toggleButton);
    container.appendChild(extraList);
  }
};

// Resolve user selection, falling back to the \"Keine Pronomen\" entry.
export const getSelectedPronounSets = (container) => {
  const selectedIndexes = Array.from(
    container.querySelectorAll('input[type="checkbox"]'),
  )
    .filter((box) => box.checked)
    .map((box) => parseInt(box.value, 10));

  if (selectedIndexes.length > 0) {
    return selectedIndexes.map((index) => allPronounSets[index]);
  }

  const index = Math.floor(Math.random() * allPronounSets.length);
  return [allPronounSets[index]];
};
