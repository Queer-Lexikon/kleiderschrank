/**
 * Tests for sample text selection utilities.
 */
import test from "node:test";
import assert from "node:assert/strict";
import {
  getSampleTextEntry,
  isDeclensionText,
  isRandomEligibleEntry,
  getRandomEligibleOptions,
  populateTextSelector,
} from "../src/features/texts.js";
import { createDom, cleanupDom } from "./helpers/dom.js";
import SampleTexts from "../data/SampleTexts.js";

const declensionKey = Object.keys(SampleTexts).find(
  (key) => SampleTexts[key]?.type === "declensions",
);

if (declensionKey) {
  test("Detects declension text entries", () => {
    assert.equal(isDeclensionText(declensionKey), true);
  });
}

test("Returns null for unknown text keys", () => {
  assert.equal(getSampleTextEntry("missing"), null);
});

test("Returns null for empty text keys", () => {
  assert.equal(getSampleTextEntry(""), null);
});

test("Returns entries for known text keys", () => {
  const entry = getSampleTextEntry("school");
  assert.ok(entry);
});

test("Returns null for null text keys", () => {
  assert.equal(getSampleTextEntry(null), null);
});

test("Honors random=false on text entries", () => {
  assert.equal(isRandomEligibleEntry({ random: false }), false);
  assert.equal(isRandomEligibleEntry({}), true);
});

test("Treats missing entries as random-eligible", () => {
  assert.equal(isRandomEligibleEntry(null), true);
});

test("Filters random-eligible text options", () => {
  const dom = createDom(`
    <select id="textSelector">
      <option value="a">A</option>
      <option value="b" data-random-eligible="false">B</option>
      <option value="c">C</option>
    </select>
  `);
  const select = dom.window.document.querySelector("#textSelector");
  const options = getRandomEligibleOptions(select);
  assert.equal(options.length, 2);
  assert.equal(options[0].value, "a");
  assert.equal(options[1].value, "c");
  cleanupDom(dom);
});

test("Populates the text selector with titles and flags", () => {
  const dom = createDom(`<select id="textSelector"></select>`);
  const select = dom.window.document.querySelector("#textSelector");
  populateTextSelector(select);

  const keys = Object.keys(SampleTexts);
  assert.equal(select.options.length, keys.length);

  const declensionOption = Array.from(select.options).find(
    (option) => option.value === "declensions",
  );
  assert.ok(declensionOption);
  assert.equal(declensionOption.textContent, SampleTexts.declensions.title);
  assert.equal(declensionOption.dataset.randomEligible, "false");

  cleanupDom(dom);
});

test("Uses the key as a label when the title is missing", () => {
  const dom = createDom(`<select id="textSelector"></select>`);
  const select = dom.window.document.querySelector("#textSelector");

  const originalEntry = SampleTexts.temp;
  SampleTexts.temp = { text: "" };

  populateTextSelector(select);

  const option = Array.from(select.options).find((opt) => opt.value === "temp");
  assert.ok(option);
  assert.equal(option.textContent, "temp");

  if (originalEntry) {
    SampleTexts.temp = originalEntry;
  } else {
    delete SampleTexts.temp;
  }

  cleanupDom(dom);
});
