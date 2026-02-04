/**
 * Tests for mobile icon row layout behavior.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { createDom, cleanupDom } from "./helpers/dom.js";
import { createMobileIconRow } from "../src/features/results/mobileIconRow.js";

test("Builds and fills the mobile icon row", () => {
  const dom = createDom();
  const document = dom.window.document;

  const resultsControls = document.createElement("div");
  const randomModeContainer = document.createElement("div");
  const anchor = document.createElement("div");
  resultsControls.append(randomModeContainer, anchor);

  const randomTextButton = document.createElement("button");
  const rerunButton = document.createElement("button");
  const listenButton = document.createElement("button");

  const mobileQuery = {
    matches: true,
    addEventListener: () => {},
  };

  const controller = createMobileIconRow({
    mobileQuery,
    resultsControls,
    randomModeContainer,
    randomTextButton,
    rerunButton,
    getListenButton: () => listenButton,
  });

  controller.update();

  assert.equal(resultsControls.children[1], controller.row);
  assert.equal(controller.row.children.length, 3);
  assert.equal(controller.row.children[0], randomTextButton);
  assert.equal(controller.row.children[1], rerunButton);
  assert.equal(controller.row.children[2], listenButton);

  cleanupDom(dom);
});

test("Reflows buttons for desktop and hides rerun", () => {
  const dom = createDom();
  const document = dom.window.document;

  const resultsControls = document.createElement("div");
  const randomModeContainer = document.createElement("div");
  randomModeContainer.classList.add("is-hidden");
  resultsControls.append(randomModeContainer);

  const randomTextButton = document.createElement("button");
  const rerunButton = document.createElement("button");
  const listenButton = document.createElement("button");

  const selectRow = document.createElement("div");
  const randomModeRow = document.createElement("div");
  const headingRow = document.createElement("div");

  const mobileQuery = {
    matches: false,
    addEventListener: () => {},
  };

  const controller = createMobileIconRow({
    mobileQuery,
    resultsControls,
    randomModeContainer,
    randomTextButton,
    rerunButton,
    getListenButton: () => listenButton,
    getHeadingRow: () => headingRow,
    getSelectRow: () => selectRow,
    getRandomModeRow: () => randomModeRow,
  });

  controller.update();

  assert.equal(rerunButton.classList.contains("is-hidden"), true);
  assert.equal(selectRow.contains(randomTextButton), true);
  assert.equal(randomModeRow.contains(rerunButton), true);
  assert.equal(headingRow.contains(listenButton), true);

  cleanupDom(dom);
});

test("Wires media query updates on attach", () => {
  const dom = createDom();
  const document = dom.window.document;

  const resultsControls = document.createElement("div");
  const randomModeContainer = document.createElement("div");
  resultsControls.append(randomModeContainer);

  const randomTextButton = document.createElement("button");
  const rerunButton = document.createElement("button");

  let handler = null;
  const mobileQuery = {
    matches: true,
    addEventListener: (_event, callback) => {
      handler = callback;
    },
  };

  const controller = createMobileIconRow({
    mobileQuery,
    resultsControls,
    randomModeContainer,
    randomTextButton,
    rerunButton,
  });

  controller.attach();
  assert.equal(typeof handler, "function");
  handler();

  assert.equal(controller.row.contains(randomTextButton), true);

  cleanupDom(dom);
});

test("Appends the row when the random mode container is missing", () => {
  const dom = createDom();
  const document = dom.window.document;

  const resultsControls = document.createElement("div");
  const randomTextButton = document.createElement("button");

  const mobileQuery = {
    matches: true,
    addEventListener: () => {},
  };

  const controller = createMobileIconRow({
    mobileQuery,
    resultsControls,
    randomTextButton,
  });

  controller.update();

  assert.equal(resultsControls.contains(controller.row), true);
  assert.equal(controller.row.contains(randomTextButton), true);

  cleanupDom(dom);
});

test("Does not reinsert the row when it is already attached", () => {
  const dom = createDom();
  const document = dom.window.document;

  const resultsControls = document.createElement("div");
  const randomModeContainer = document.createElement("div");
  const randomTextButton = document.createElement("button");

  const mobileQuery = {
    matches: true,
    addEventListener: () => {},
  };

  const controller = createMobileIconRow({
    mobileQuery,
    resultsControls,
    randomModeContainer,
    randomTextButton,
  });

  controller.update();
  controller.update();

  assert.equal(resultsControls.contains(controller.row), true);

  cleanupDom(dom);
});

test("Appends the row when the random mode container is external", () => {
  const dom = createDom();
  const document = dom.window.document;

  const resultsControls = document.createElement("div");
  const randomModeContainer = document.createElement("div");
  const randomTextButton = document.createElement("button");

  const mobileQuery = {
    matches: true,
    addEventListener: () => {},
  };

  const controller = createMobileIconRow({
    mobileQuery,
    resultsControls,
    randomModeContainer,
    randomTextButton,
  });

  controller.update();

  assert.equal(resultsControls.contains(controller.row), true);

  cleanupDom(dom);
});

test("Shows the rerun button when random mode is visible", () => {
  const dom = createDom();
  const document = dom.window.document;

  const resultsControls = document.createElement("div");
  const randomModeContainer = document.createElement("div");
  const rerunButton = document.createElement("button");

  const mobileQuery = {
    matches: false,
    addEventListener: () => {},
  };

  const controller = createMobileIconRow({
    mobileQuery,
    resultsControls,
    randomModeContainer,
    rerunButton,
  });

  controller.update();

  assert.equal(rerunButton.classList.contains("is-hidden"), false);

  cleanupDom(dom);
});

test("Inserts the row after the random mode container when present", () => {
  const dom = createDom();
  const document = dom.window.document;

  const resultsControls = document.createElement("div");
  const randomModeContainer = document.createElement("div");
  const anchor = document.createElement("div");
  resultsControls.append(randomModeContainer, anchor);

  const randomTextButton = document.createElement("button");
  const rerunButton = document.createElement("button");

  const mobileQuery = {
    matches: true,
    addEventListener: () => {},
  };

  const controller = createMobileIconRow({
    mobileQuery,
    resultsControls,
    randomModeContainer,
    randomTextButton,
    rerunButton,
  });

  controller.update();

  assert.equal(resultsControls.children[1], controller.row);

  cleanupDom(dom);
});
