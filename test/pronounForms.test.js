/**
 * Tests for pronoun form labels and declension field metadata.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { getPronounFormLabel, DECLENSION_FIELDS } from "../src/domain/pronounForms.js";

const labels = DECLENSION_FIELDS.map((item) => item.label);

const cases = [
  ["Nominativ", "Nominativ"],
  ["dativ", "Dativ"],
  ["Akkusativ", "Akkusativ"],
  ["Poss. 1", "Poss. 1"],
  ["poss. 6", "Poss. 6"],
  ["Bezeichnung", "Bezeichnung"],
  [" custom ", "custom"],
];

for (const [input, expected] of cases) {
  test(`Normalizes pronoun form label: ${input}`, () => {
    assert.equal(getPronounFormLabel(input), expected);
  });
}

test("Declension fields are ordered and complete", () => {
  assert.deepEqual(labels, [
    "Nominativ",
    "Dativ",
    "Akkusativ",
    "Possessiv 1",
    "Possessiv 2",
    "Possessiv 3",
    "Possessiv 4",
    "Possessiv 5",
    "Possessiv 6",
  ]);
});

test("Handles empty labels and possessive without number", () => {
  assert.equal(getPronounFormLabel(""), "");
  assert.equal(getPronounFormLabel(null), "");
  assert.equal(getPronounFormLabel("Poss."), "Possessiv");
});
