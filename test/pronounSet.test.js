/**
 * Tests for PronounSet behavior and name fallbacks.
 */
import test from "node:test";
import assert from "node:assert/strict";
import PronounSet from "../src/domain/pronounSet.js";

test("Falls back to name when no pronoun forms exist", () => {
  const set = new PronounSet({
    bezeichnung: "Keine Pronomen",
    nominativ: null,
    dativ: null,
    akkusativ: null,
    poss1: null,
    poss2: null,
    poss3: null,
    poss4: null,
    poss5: null,
    poss6: null,
  });
  assert.equal(set.getForm("nominativ", "Alex"), "Alex");
});

test("Builds possessive forms for edge cases", () => {
  assert.equal(PronounSet.possessive(""), "");
  assert.equal(PronounSet.possessive("   "), "");
  assert.equal(PronounSet.possessive("Alex"), "Alex'");
  assert.equal(PronounSet.possessive("Jas"), "Jas'");
  assert.equal(PronounSet.possessive("Mia"), "Mias");
  assert.equal(PronounSet.possessive("Ša"), "Šas");
  assert.equal(PronounSet.possessive("123"), "123s");
});

test("Uses name fallbacks for 'Keine Pronomen'", () => {
  const set = new PronounSet({
    bezeichnung: "Keine Pronomen",
    nominativ: null,
    dativ: null,
    akkusativ: null,
    poss1: null,
    poss2: null,
    poss3: null,
    poss4: null,
    poss5: null,
    poss6: null,
  });

  assert.equal(set.getForm("dativ", "Taylor"), "Taylor");
  assert.equal(set.getForm("akkusativ", "Taylor"), "Taylor");
  assert.equal(set.getForm("Poss. 1", "Taylor"), "Taylors");
  assert.equal(set.getForm("Unbekannt", "Taylor"), "Taylor");
});

test("Returns configured pronoun forms", () => {
  const set = new PronounSet({
    bezeichnung: "Sie/ihr",
    nominativ: "sie",
    dativ: "ihr",
    akkusativ: "sie",
    poss1: "ihr",
    poss2: "ihre",
    poss3: "ihren",
    poss4: "ihrer",
    poss5: "ihrem",
    poss6: "ihres",
  });

  assert.equal(set.getForm("nominativ", "Alex"), "sie");
  assert.equal(set.getForm("poss. 4", "Alex"), "ihrer");
  assert.equal(set.getForm("unknown", "Alex"), "");
});
