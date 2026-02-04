/**
 * Tests for pronoun recommendation module.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { createDom, cleanupDom } from "./helpers/dom.js";
import {
  pickRandomPronounEntries,
  buildPronounRecommendations,
  bindPronounCheckboxSync,
} from "../src/features/pronounRecommendations.js";

const sampleSets = [
  { bezeichnung: "Sie/ihr", group: "Häufige Pronomen" },
  { bezeichnung: "Er/ihm", group: "Häufige Pronomen" },
  { bezeichnung: "Xier", group: "Weitere Pronomen" },
  { bezeichnung: "Dee/deren", group: "Weitere Pronomen" },
  { bezeichnung: "They/them", group: "Englisch" },
];

test("Returns no recommendations for an invalid count", () => {
  assert.deepEqual(pickRandomPronounEntries(sampleSets, new Set(), 0), []);
  assert.deepEqual(pickRandomPronounEntries(sampleSets, new Set(), -1), []);
});

test("Returns no recommendations for an invalid list", () => {
  assert.deepEqual(pickRandomPronounEntries(null, new Set(), 3), []);
});

test("Excludes primary groups and caps recommendation count", () => {
  const originalRandom = Math.random;
  Math.random = () => 0;
  const entries = pickRandomPronounEntries(
    sampleSets,
    new Set(["Häufige Pronomen"]),
    10,
  );
  Math.random = originalRandom;

  assert.equal(entries.length, 3);
  entries.forEach(({ set }) => {
    assert.notEqual(set.group, "Häufige Pronomen");
  });
});

test("Renders recommendation headline and list", () => {
  const dom = createDom("<div id=\"container\"></div>");
  const entries = [
    { set: { bezeichnung: "Xier" }, index: 2 },
    { set: { bezeichnung: "Dee/deren" }, index: 3 },
  ];
  const element = buildPronounRecommendations(entries);
  const title = element.querySelector(".pronoun-group__title");
  const checkboxes = element.querySelectorAll("input[type=\"checkbox\"]");

  assert.equal(title?.textContent, "Kennst du schon...");
  assert.equal(checkboxes.length, 2);
  assert.equal(checkboxes[0].value, "2");

  cleanupDom(dom);
});

test("Returns no recommendations when all groups are excluded", () => {
  const entries = pickRandomPronounEntries(
    sampleSets,
    new Set(["Häufige Pronomen", "Weitere Pronomen", "Englisch"]),
    3,
  );
  assert.equal(entries.length, 0);
});

test("Renders an empty list when there are no recommendations", () => {
  const dom = createDom();
  const element = buildPronounRecommendations([]);
  const items = element.querySelectorAll(".pronoun-item");
  assert.equal(items.length, 0);
  cleanupDom(dom);
});

test("Syncs duplicate recommendation checkboxes", () => {
  const dom = createDom();
  const document = dom.window.document;
  const container = document.createElement("div");

  const first = document.createElement("input");
  first.type = "checkbox";
  first.value = "1";
  container.appendChild(first);

  const second = document.createElement("input");
  second.type = "checkbox";
  second.value = "1";
  container.appendChild(second);

  bindPronounCheckboxSync(container);

  first.checked = true;
  first.dispatchEvent(new dom.window.Event("change", { bubbles: true }));
  assert.equal(second.checked, true);

  second.checked = false;
  second.dispatchEvent(new dom.window.Event("change", { bubbles: true }));
  assert.equal(first.checked, false);

  cleanupDom(dom);
});

test("Ignores non-checkbox changes when syncing recommendations", () => {
  const dom = createDom();
  const document = dom.window.document;
  const container = document.createElement("div");

  const input = document.createElement("input");
  input.type = "text";
  input.value = "1";
  container.appendChild(input);

  bindPronounCheckboxSync(container);

  input.dispatchEvent(new dom.window.Event("change", { bubbles: true }));
  assert.equal(
    container.querySelectorAll("input[type=\"checkbox\"]").length,
    0,
  );

  cleanupDom(dom);
});

test("Does not sync checkboxes without values", () => {
  const dom = createDom();
  const document = dom.window.document;
  const container = document.createElement("div");

  const first = document.createElement("input");
  first.type = "checkbox";
  first.value = "";
  container.appendChild(first);

  const second = document.createElement("input");
  second.type = "checkbox";
  second.value = "";
  container.appendChild(second);

  bindPronounCheckboxSync(container);

  first.checked = true;
  first.dispatchEvent(new dom.window.Event("change", { bubbles: true }));
  assert.equal(second.checked, false);

  cleanupDom(dom);
});

test("Ignores change events from non-input targets", () => {
  const dom = createDom();
  const document = dom.window.document;
  const container = document.createElement("div");
  const child = document.createElement("div");
  container.appendChild(child);

  bindPronounCheckboxSync(container);

  child.dispatchEvent(new dom.window.Event("change", { bubbles: true }));

  cleanupDom(dom);
});
