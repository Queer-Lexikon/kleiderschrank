import PronounSet from "../domain/pronounSet.js";
import pronounSetsData from "../../data/pronounSets.js";
import {
  bindPronounCheckboxSync,
  buildPronounRecommendations,
  pickRandomPronounEntries,
} from "./pronounRecommendations.js";
// Preload all pronoun sets from data for reuse across UI.
export const allPronounSets = pronounSetsData.map((def) => new PronounSet(def));

/**
 * Build a group section with checkboxes for each pronoun set.
 * @param {string} groupName
 * @param {Array<{set: PronounSet, index: number}>} entries
 * @returns {HTMLElement}
 */
function buildGroup(groupName, entries) {
  const group = document.createElement("div");
  group.className = "pronoun-group";

  const title = document.createElement("h2");
  title.className = "pronoun-group__title";
  title.textContent = groupName;
  group.appendChild(title);

  const list = document.createElement("div");
  list.className = "pronoun-list";

  const sortedEntries = [...entries].sort((a, b) =>
    a.set.bezeichnung.localeCompare(b.set.bezeichnung, "de"),
  );

  sortedEntries.forEach(({ set, index }) => {
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
    list.appendChild(row);
  });

  group.appendChild(list);
  return group;
}

/**
 * Toggle the expanded/collapsed state of extra pronoun groups.
 * @param {HTMLElement} extraList
 * @param {HTMLButtonElement} toggleButton
 */
function handleTogglePronounGroups(extraList, toggleButton) {
  const isCollapsed = extraList.classList.toggle("is-collapsed");
  toggleButton.setAttribute("aria-expanded", (!isCollapsed).toString());
  toggleButton.textContent = isCollapsed
    ? "Weitere Pronomen anzeigen"
    : "Weniger Pronomen anzeigen";
}

// Render the checkbox list for pronoun sets.
/**
 * Populate the pronoun checkbox UI grouped by category.
 * @param {HTMLElement} container
 */
export function populatePronounCheckboxes(container) {
  const primaryGroups = new Set(["Häufige Pronomen"]);
  const recommendationEntries = pickRandomPronounEntries(
    allPronounSets,
    primaryGroups,
    3,
  );

  const primaryList = document.createElement("div");
  primaryList.className = "pronoun-groups pronoun-groups--primary";

  const extraList = document.createElement("div");
  extraList.className = "pronoun-groups pronoun-groups--extra is-collapsed";
  extraList.id = "pronounExtraList";

  const groupedSets = new Map();

  allPronounSets.forEach((set, index) => {
    const groupName = set.group || "Weitere Pronomen";
    if (!groupedSets.has(groupName)) {
      groupedSets.set(groupName, []);
    }
    groupedSets.get(groupName).push({ set, index });
  });

  const orderedGroups = Array.from(groupedSets.entries());

  orderedGroups.forEach(([groupName, entries]) => {
    const groupElement = buildGroup(groupName, entries);
    if (primaryGroups.has(groupName)) {
      if (groupName === "Häufige Pronomen") {
        groupElement.appendChild(
          buildPronounRecommendations(recommendationEntries),
        );
      }
      primaryList.appendChild(groupElement);
    } else {
      extraList.appendChild(groupElement);
    }
  });

  container.appendChild(primaryList);

  const toggleButton = document.createElement("button");
  toggleButton.type = "button";
  toggleButton.className = "pronoun-toggle";
  toggleButton.setAttribute("aria-expanded", "false");
  toggleButton.setAttribute("aria-controls", "pronounExtraList");
  toggleButton.textContent = "Weitere Pronomen anzeigen";
  toggleButton.addEventListener(
    "click",
    handleTogglePronounGroups.bind(null, extraList, toggleButton),
  );

  const hasExtraGroups = extraList.childElementCount > 0;
  toggleButton.hidden = !hasExtraGroups;
  extraList.hidden = !hasExtraGroups;

  container.appendChild(toggleButton);
  container.appendChild(extraList);
  bindPronounCheckboxSync(container);
}

// Resolve user selection, falling back to the \"Keine Pronomen\" entry.
/**
 * Return selected pronoun sets, optionally falling back to random.
 * @param {HTMLElement} container
 * @param {{fallbackToRandom?: boolean}} options
 * @returns {PronounSet[]}
 */
export function getSelectedPronounSets(
  container,
  { fallbackToRandom = true } = {},
) {
  const selectedIndexes = Array.from(
    new Set(
      Array.from(container.querySelectorAll('input[type="checkbox"]'))
        .filter((box) => box.checked)
        .map((box) => box.value),
    ),
  ).map((value) => parseInt(value, 10));

  if (selectedIndexes.length > 0) {
    return selectedIndexes.map((index) => allPronounSets[index]);
  }

  if (!fallbackToRandom) {
    return [];
  }

  const index = Math.floor(Math.random() * allPronounSets.length);
  return [allPronounSets[index]];
}
