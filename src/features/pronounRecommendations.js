/**
 * Pick random pronoun entries, excluding specified groups.
 * @param {Array<{group?: string}>} pronounSets
 * @param {Set<string>} excludedGroups
 * @param {number} count
 * @returns {Array<{set: {bezeichnung: string, group?: string}, index: number}>}
 */
export function pickRandomPronounEntries(pronounSets, excludedGroups, count) {
  if (!Array.isArray(pronounSets) || count <= 0) {
    return [];
  }

  const entries = pronounSets
    .map((set, index) => ({ set, index }))
    .filter(({ set }) => !excludedGroups.has(set.group || "Weitere Pronomen"));

  for (let i = entries.length - 1; i > 0; i -= 1) {
    const swapIndex = Math.floor(Math.random() * (i + 1));
    [entries[i], entries[swapIndex]] = [entries[swapIndex], entries[i]];
  }

  return entries.slice(0, Math.min(count, entries.length));
}

/**
 * Build the "Kennst du schon..." recommendation list element.
 * @param {Array<{set: {bezeichnung: string}, index: number}>} entries
 * @returns {HTMLElement}
 */
export function buildPronounRecommendations(entries) {
  const wrapper = document.createElement("div");
  wrapper.className = "pronoun-group";

  const title = document.createElement("h2");
  title.className = "pronoun-group__title";
  title.textContent = "Kennst du schon...";
  wrapper.appendChild(title);

  const list = document.createElement("div");
  list.className = "pronoun-list";

  entries.forEach(({ set, index }) => {
    const label = document.createElement("label");
    const checkbox = document.createElement("input");

    checkbox.type = "checkbox";
    checkbox.value = index.toString();
    label.appendChild(checkbox);

    const textNode = document.createTextNode(` ${set.bezeichnung}`);
    label.appendChild(textNode);

    const row = document.createElement("div");
    row.className = "pronoun-item";
    row.appendChild(label);
    list.appendChild(row);
  });

  wrapper.appendChild(list);
  return wrapper;
}

/**
 * Keep checkbox states in sync for duplicate pronoun entries.
 * @param {HTMLElement} container
 */
export function bindPronounCheckboxSync(container) {
  container.addEventListener("change", (event) => {
    const target = event.target;
    if (!target || target.tagName !== "INPUT") {
      return;
    }

    const checkbox = /** @type {HTMLInputElement} */ (target);
    if (checkbox.type !== "checkbox" || checkbox.value === "") {
      return;
    }

    const matching = container.querySelectorAll(
      `input[type="checkbox"][value="${checkbox.value}"]`,
    );

    matching.forEach((input) => {
      if (input !== checkbox) {
        input.checked = checkbox.checked;
      }
    });
  });
}
