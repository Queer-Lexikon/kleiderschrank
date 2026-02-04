/**
 * Tests for PronounTool utility methods.
 */
import test from "node:test";
import assert from "node:assert/strict";
import PronounTool from "../src/domain/pronounTool.js";

const sampleSets = [{ label: "a" }, { label: "b" }, { label: "c" }];

test("Escapes special characters in rendered output", () => {
  const value = `& < > " '`;
  assert.equal(
    PronounTool.escapeHTML(value),
    "&amp; &lt; &gt; &quot; &#39;",
  );
  assert.equal(PronounTool.escapeHTML(null), "");
});

test("Matches token capitalization for pronoun forms", () => {
  assert.equal(PronounTool.adjustCase("Nominativ", "sie"), "Sie");
  assert.equal(PronounTool.adjustCase("nominativ", "sie"), "sie");
  assert.equal(PronounTool.adjustCase("  Nominativ ", "sie"), "Sie");
  assert.equal(PronounTool.adjustCase("n", ""), "");
});

test("Recognizes supported pronoun tokens", () => {
  assert.equal(PronounTool.isPronounToken("Nominativ"), true);
  assert.equal(PronounTool.isPronounToken("Dativ"), true);
  assert.equal(PronounTool.isPronounToken("Akkusativ"), true);
  assert.equal(PronounTool.isPronounToken("akkuativ"), false);
  assert.equal(PronounTool.isPronounToken("Poss. 2"), true);
  assert.equal(PronounTool.isPronounToken("Bezeichnung"), true);
  assert.equal(PronounTool.isPronounToken("Vorname"), false);
});

test("Selects random pronoun entries using Math.random", () => {
  const originalRandom = Math.random;
  Math.random = () => 0;
  assert.equal(PronounTool.randomChoice(sampleSets), sampleSets[0]);
  Math.random = () => 0.9;
  assert.equal(PronounTool.randomChoice(sampleSets), sampleSets[2]);
  Math.random = originalRandom;
});
