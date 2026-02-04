/**
 * Tests for the declension view rendering.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { createDom, cleanupDom } from "./helpers/dom.js";
import { createDeclensionView } from "../src/features/results/declensionView.js";
import PronounSet from "../src/domain/pronounSet.js";

/**
 * Build a basic PronounSet for table rendering.
 * @param {string} label
 * @returns {PronounSet}
 */
const makePronounSet = (label) =>
  new PronounSet({
    bezeichnung: label,
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

test("Renders declension tables with tabs", () => {
  const dom = createDom();
  const tabChanges = [];
  const view = createDeclensionView({
    pronounSets: [makePronounSet("Sie/ihr"), makePronounSet("Er/ihm")],
    names: [{ firstName: "Alex", lastName: "Miller", lastNameSource: "user" }],
    initialTabId: "declension-tab-sample-0",
    onTabChange: (tabId) => tabChanges.push(tabId),
  });
  assert.ok(view.querySelector(".declension-tablist"));
  assert.ok(view.querySelector(".declension-table"));
  assert.equal(tabChanges.at(-1), "declension-tab-sample-0");

  const tableInput = view.querySelector("#declension-tab-table");
  tableInput.dispatchEvent(new dom.window.Event("change", { bubbles: true }));
  const sampleInput = view.querySelector("#declension-tab-sample-0");
  sampleInput.dispatchEvent(new dom.window.Event("change", { bubbles: true }));
  cleanupDom(dom);
});

test("Shows an empty declension wrapper without pronoun sets", () => {
  const dom = createDom();
  const view = createDeclensionView({ pronounSets: [] });
  assert.equal(view.className, "declension-tables");
  assert.equal(view.children.length, 0);
  cleanupDom(dom);
});

test("Handles null pronoun sets with an empty wrapper", () => {
  const dom = createDom();
  const view = createDeclensionView({ pronounSets: null });
  assert.equal(view.className, "declension-tables");
  assert.equal(view.children.length, 0);
  cleanupDom(dom);
});

test("Handles missing pronoun sets with an empty wrapper", () => {
  const dom = createDom();
  const view = createDeclensionView({});
  assert.equal(view.className, "declension-tables");
  assert.equal(view.children.length, 0);
  cleanupDom(dom);
});

test("Renders declensions even when names are undefined", () => {
  const dom = createDom();
  const view = createDeclensionView({
    pronounSets: [makePronounSet("Sie/ihr")],
  });
  assert.ok(view.querySelector(".declension-table"));
  cleanupDom(dom);
});

test("Ignores blank names when choosing placeholders", () => {
  const dom = createDom();
  const view = createDeclensionView({
    pronounSets: [makePronounSet("Sie/ihr")],
    names: [{ firstName: "   ", lastName: "Miller", lastNameSource: "user" }],
  });
  assert.ok(view.querySelector(".declension-table"));
  cleanupDom(dom);
});

test("Uses provided names in sample cards", () => {
  const dom = createDom();
  const view = createDeclensionView({
    pronounSets: [makePronounSet("Sie/ihr")],
    names: [{ firstName: "Taylor", lastName: "Miller", lastNameSource: "user" }],
  });
  const sampleCard = view.querySelector(".declension-sample-card");
  assert.ok(sampleCard.textContent.includes("Taylor"));
  cleanupDom(dom);
});

test("Falls back to auto-generated names when provided names are empty", () => {
  const dom = createDom();
  const originalRandom = Math.random;
  Math.random = () => 0;

  const view = createDeclensionView({
    pronounSets: [makePronounSet("Sie/ihr")],
    names: [{ firstName: "", lastName: "", lastNameSource: "user" }],
  });

  const sampleCard = view.querySelector(".declension-sample-card");
  assert.ok(sampleCard.textContent.length > 0);

  Math.random = originalRandom;
  cleanupDom(dom);
});

test("Defaults missing last-name metadata", () => {
  const dom = createDom();
  const view = createDeclensionView({
    pronounSets: [makePronounSet("Sie/ihr")],
    names: [{ firstName: "Alex", lastName: "", lastNameSource: "" }],
  });
  assert.ok(view.querySelector(".declension-table"));
  cleanupDom(dom);
});

test("Falls back when first names are missing", () => {
  const dom = createDom();
  const view = createDeclensionView({
    pronounSets: [makePronounSet("Sie/ihr")],
    names: [{ lastName: "Miller", lastNameSource: "user" }],
  });
  assert.ok(view.querySelector(".declension-table"));
  cleanupDom(dom);
});

test("Shows a dash for missing declension forms", () => {
  const dom = createDom();
  const sparseSet = new PronounSet({
    bezeichnung: "Test",
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

  const view = createDeclensionView({
    pronounSets: [sparseSet],
    names: [{ firstName: "Alex", lastName: "Miller", lastNameSource: "user" }],
  });

  const cell = view.querySelector("tbody td");
  assert.equal(cell.textContent, "—");

  cleanupDom(dom);
});

test("Ignores tab change events without targets", () => {
  const dom = createDom();
  const captured = [];
  const originalAdd = dom.window.HTMLInputElement.prototype.addEventListener;

  dom.window.HTMLInputElement.prototype.addEventListener = function (
    type,
    handler,
    options,
  ) {
    if (type === "change") {
      captured.push(handler);
    }
    return originalAdd.call(this, type, handler, options);
  };

  const view = createDeclensionView({
    pronounSets: [makePronounSet("Sie/ihr")],
    names: [{ firstName: "Alex", lastName: "Miller", lastNameSource: "user" }],
  });
  assert.ok(view.querySelector(".declension-table"));
  captured.forEach((handler) => handler({ target: null }));

  dom.window.HTMLInputElement.prototype.addEventListener = originalAdd;
  cleanupDom(dom);
});
