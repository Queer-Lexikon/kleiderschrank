/**
 * Tests for pronoun checkbox UI rendering and selection.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { createDom, cleanupDom } from "./helpers/dom.js";
import {
  populatePronounCheckboxes,
  getSelectedPronounSets,
  allPronounSets,
} from "../src/features/pronouns.js";
import pronounSetsData from "../data/pronounSets.js";

test("Renders pronoun groups and checkboxes", () => {
  const dom = createDom("<div id=\"container\"></div>");
  const container = dom.window.document.querySelector("#container");
  populatePronounCheckboxes(container);
  assert.ok(container.querySelector(".pronoun-groups"));
  assert.ok(container.querySelector("input[type=\"checkbox\"]"));
  cleanupDom(dom);
});

test("Toggles additional pronoun groups", () => {
  const dom = createDom("<div id=\"container\"></div>");
  const container = dom.window.document.querySelector("#container");
  populatePronounCheckboxes(container);

  const toggleButton = container.querySelector(".pronoun-toggle");
  const extraList = container.querySelector("#pronounExtraList");
  assert.ok(toggleButton);
  assert.ok(extraList);
  assert.equal(extraList.classList.contains("is-collapsed"), true);

  toggleButton.click();
  assert.equal(extraList.classList.contains("is-collapsed"), false);
  assert.equal(toggleButton.getAttribute("aria-expanded"), "true");

  toggleButton.click();
  assert.equal(extraList.classList.contains("is-collapsed"), true);
  assert.equal(toggleButton.getAttribute("aria-expanded"), "false");

  cleanupDom(dom);
});

test("Keeps recommended pronouns in sync with the main list", () => {
  const dom = createDom("<div id=\"container\"></div>");
  const container = dom.window.document.querySelector("#container");

  const originalRandom = Math.random;
  Math.random = () => 0;
  populatePronounCheckboxes(container);
  Math.random = originalRandom;

  const recommendedGroup = Array.from(
    container.querySelectorAll(".pronoun-group"),
  ).find(
    (group) =>
      group.querySelector(".pronoun-group__title")?.textContent ===
      "Kennst du schon...",
  );
  const recommendedCheckbox = recommendedGroup?.querySelector(
    "input[type=\"checkbox\"]",
  );
  assert.ok(recommendedCheckbox);

  const allCheckboxes = Array.from(
    container.querySelectorAll('input[type="checkbox"]'),
  );
  const mainCheckbox = allCheckboxes.find(
    (input) =>
      input.value === recommendedCheckbox.value &&
      input.closest(".pronoun-group") !== recommendedGroup,
  );
  assert.ok(mainCheckbox);

  recommendedCheckbox.checked = true;
  recommendedCheckbox.dispatchEvent(
    new dom.window.Event("change", { bubbles: true }),
  );
  assert.equal(mainCheckbox.checked, true);

  mainCheckbox.checked = false;
  mainCheckbox.dispatchEvent(
    new dom.window.Event("change", { bubbles: true }),
  );
  assert.equal(recommendedCheckbox.checked, false);

  cleanupDom(dom);
});

test("Collects selected pronoun sets", () => {
  const dom = createDom("<div id=\"container\"></div>");
  const container = dom.window.document.querySelector("#container");
  populatePronounCheckboxes(container);
  const first = container.querySelector("input[type=\"checkbox\"]");
  first.checked = true;
  const selected = getSelectedPronounSets(container);
  assert.equal(selected.length, 1);
  cleanupDom(dom);
});

test("Deduplicates selected pronoun sets", () => {
  const dom = createDom("<div id=\"container\"></div>");
  const container = dom.window.document.querySelector("#container");
  populatePronounCheckboxes(container);

  const first = container.querySelector("input[type=\"checkbox\"]");
  const duplicate = first.cloneNode();
  duplicate.value = first.value;
  duplicate.checked = true;
  first.checked = true;
  container.appendChild(duplicate);

  const selected = getSelectedPronounSets(container, {
    fallbackToRandom: false,
  });
  assert.equal(selected.length, 1);

  cleanupDom(dom);
});

test("Falls back to random selection when nothing is checked", () => {
  const dom = createDom("<div id=\"container\"></div>");
  const container = dom.window.document.querySelector("#container");
  populatePronounCheckboxes(container);

  const originalRandom = Math.random;
  Math.random = () => 0;
  const selected = getSelectedPronounSets(container);
  Math.random = originalRandom;

  assert.equal(selected.length, 1);

  const emptySelected = getSelectedPronounSets(container, { fallbackToRandom: false });
  assert.equal(emptySelected.length, 0);
  cleanupDom(dom);
});

test("Hides the extra-group toggle when there are no extra groups", () => {
  const dom = createDom("<div id=\"container\"></div>");
  const container = dom.window.document.querySelector("#container");
  const originalSets = allPronounSets.slice();

  allPronounSets.length = 0;
  allPronounSets.push({
    bezeichnung: "Sie/ihr",
    group: "Häufige Pronomen",
  });

  populatePronounCheckboxes(container);
  const toggle = container.querySelector(".pronoun-toggle");
  assert.ok(toggle);
  assert.equal(toggle.hidden, true);

  allPronounSets.length = 0;
  originalSets.forEach((set) => allPronounSets.push(set));
  cleanupDom(dom);
});

test("Assigns a default group when a pronoun lacks one", () => {
  const dom = createDom("<div id=\"container\"></div>");
  const container = dom.window.document.querySelector("#container");
  const originalSets = allPronounSets.slice();

  allPronounSets.length = 0;
  allPronounSets.push({
    bezeichnung: "Test",
  });

  populatePronounCheckboxes(container);
  const groupTitle = container.querySelector(".pronoun-group__title");
  assert.equal(groupTitle?.textContent, "Weitere Pronomen");

  allPronounSets.length = 0;
  originalSets.forEach((set) => allPronounSets.push(set));
  cleanupDom(dom);
});

test("Renders groups that are outside the default order", () => {
  const dom = createDom("<div id=\"container\"></div>");
  const container = dom.window.document.querySelector("#container");
  const originalSets = allPronounSets.slice();

  allPronounSets.length = 0;
  allPronounSets.push(
    { bezeichnung: "Sie/ihr", group: "Häufige Pronomen" },
    { bezeichnung: "Test", group: "Spezialgruppe" },
  );

  populatePronounCheckboxes(container);
  const titles = Array.from(container.querySelectorAll(".pronoun-group__title"))
    .map((node) => node.textContent);
  assert.ok(titles.includes("Spezialgruppe"));

  allPronounSets.length = 0;
  originalSets.forEach((set) => allPronounSets.push(set));
  cleanupDom(dom);
});

test("Groups multiple pronoun entries together", () => {
  const dom = createDom("<div id=\"container\"></div>");
  const container = dom.window.document.querySelector("#container");
  const originalSets = allPronounSets.slice();

  allPronounSets.length = 0;
  allPronounSets.push(
    { bezeichnung: "Sie/ihr", group: "Häufige Pronomen" },
    { bezeichnung: "Er/ihm", group: "Häufige Pronomen" },
  );

  populatePronounCheckboxes(container);
  const items = container.querySelectorAll(".pronoun-item");
  assert.equal(items.length, 2);

  allPronounSets.length = 0;
  originalSets.forEach((set) => allPronounSets.push(set));
  cleanupDom(dom);
});

test("Includes empty forms for 'Keine Pronomen'", () => {
  const none = pronounSetsData.find((set) => set.bezeichnung === "Keine Pronomen");
  assert.ok(none);
  assert.equal(none.poss4, null);
  assert.equal(none.poss5, null);
  assert.equal(none.poss6, null);
});
