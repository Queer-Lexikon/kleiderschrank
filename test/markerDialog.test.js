/**
 * Tests for marker dialog behavior and positioning.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { createDom, cleanupDom } from "./helpers/dom.js";
import { initMarkerDialog } from "../src/features/results/markerDialog.js";

const baseDom = `
  <dialog id="markerDialog">
    <div id="markerDialogBody"></div>
    <h2 id="markerDialogTitle"></h2>
    <button data-dialog-close>Close</button>
  </dialog>
  <div id="resultsOutput"></div>
`;

test("Opens the marker dialog on click", () => {
  const dom = createDom(baseDom);
  const document = dom.window.document;
  const resultsOutput = document.querySelector("#resultsOutput");
  const dialogEl = document.querySelector("#markerDialog");
  dialogEl.close = () => dialogEl.removeAttribute("open");
  resultsOutput.innerHTML = `
    <span data-pronoun="" data-pronoun-form="" role="button" tabindex="0">sie</span>
  `;

  const dialog = initMarkerDialog({
    dialog: dialogEl,
    dialogBody: document.querySelector("#markerDialogBody"),
    dialogTitle: document.querySelector("#markerDialogTitle"),
    resultsOutput,
  });

  const marker = resultsOutput.querySelector("span");
  marker.click();

  assert.equal(document.querySelector("#markerDialogTitle").textContent, "Pronomen-Info");
  assert.ok(document.querySelector("#markerDialogBody").textContent.includes("–"));

  dialog.close();
  cleanupDom(dom);
});

test("Provides no-op dialog handlers when elements are missing", () => {
  const handlers = initMarkerDialog({});
  assert.equal(typeof handlers.open, "function");
  assert.equal(typeof handlers.close, "function");
  handlers.open();
  handlers.close();
});

test("Positions the dialog, handles keyboard, and closes on escape/outside", () => {
  const dom = createDom(baseDom);
  const document = dom.window.document;
  const resultsOutput = document.querySelector("#resultsOutput");
  const dialogEl = document.querySelector("#markerDialog");
  const dialogBody = document.querySelector("#markerDialogBody");
  const dialogTitle = document.querySelector("#markerDialogTitle");

  dialogBody.setAttribute("tabindex", "-1");
  dialogEl.showModal = () => {
    dialogEl.open = true;
    dialogEl.setAttribute("open", "true");
  };
  dialogEl.close = () => {
    dialogEl.open = false;
    dialogEl.removeAttribute("open");
  };

  const marker = document.createElement("span");
  marker.setAttribute("data-pronoun", "Sie/ihr");
  marker.setAttribute("data-pronoun-form", "Dativ");
  marker.setAttribute("role", "button");
  marker.setAttribute("tabindex", "0");
  marker.getBoundingClientRect = () => ({
    top: 260,
    bottom: 280,
    left: 10,
    width: 20,
    height: 20,
    right: 30,
  });
  resultsOutput.appendChild(marker);

  dialogEl.getBoundingClientRect = () => ({
    top: 0,
    bottom: 80,
    left: 0,
    right: 200,
    width: 200,
    height: 80,
  });

  dom.window.innerWidth = 320;
  dom.window.innerHeight = 300;

  initMarkerDialog({
    dialog: dialogEl,
    dialogBody,
    dialogTitle,
    resultsOutput,
  });

  const enterEvent = new dom.window.KeyboardEvent("keydown", {
    key: "Enter",
    bubbles: true,
  });
  marker.dispatchEvent(enterEvent);

  assert.equal(dialogTitle.textContent, "Pronomen-Info");
  assert.equal(dialogEl.dataset.placement, "top");
  assert.equal(marker.getAttribute("aria-expanded"), "true");

  marker.getBoundingClientRect = () => ({
    top: 200,
    bottom: 220,
    left: 100,
    width: 20,
    height: 20,
    right: 120,
  });
  dom.window.dispatchEvent(new dom.window.Event("resize"));
  assert.ok(dialogEl.style.left.includes("px"));

  document.body.dispatchEvent(
    new dom.window.Event("pointerdown", { bubbles: true }),
  );
  assert.equal(marker.getAttribute("aria-expanded"), "false");

  marker.click();
  document.dispatchEvent(
    new dom.window.KeyboardEvent("keydown", { key: "Escape" }),
  );
  assert.equal(marker.getAttribute("aria-expanded"), "false");

  cleanupDom(dom);
});

test("Restores focus and closes via the button", () => {
  const dom = createDom(baseDom);
  const document = dom.window.document;
  const resultsOutput = document.querySelector("#resultsOutput");
  const dialogEl = document.querySelector("#markerDialog");
  const dialogBody = document.querySelector("#markerDialogBody");
  const dialogTitle = document.querySelector("#markerDialogTitle");

  dialogBody.setAttribute("tabindex", "-1");
  dialogEl.show = () => {
    dialogEl.open = true;
    dialogEl.setAttribute("open", "true");
  };
  dialogEl.showModal = undefined;
  dialogEl.close = () => {
    dialogEl.open = false;
    dialogEl.removeAttribute("open");
  };
  dialogEl.getBoundingClientRect = () => ({
    top: 0,
    bottom: 80,
    left: 0,
    right: 200,
    width: 200,
    height: 80,
  });

  const focusTarget = document.createElement("button");
  focusTarget.textContent = "Focus";
  document.body.appendChild(focusTarget);

  const nameMarker = document.createElement("span");
  nameMarker.setAttribute("data-name", "true");
  nameMarker.setAttribute("data-name-source", "auto");
  nameMarker.setAttribute("role", "button");
  nameMarker.setAttribute("tabindex", "0");
  nameMarker.getBoundingClientRect = () => ({
    top: 40,
    bottom: 60,
    left: 40,
    width: 20,
    height: 20,
    right: 60,
  });
  resultsOutput.appendChild(nameMarker);

  const controller = initMarkerDialog({
    dialog: dialogEl,
    dialogBody,
    dialogTitle,
    resultsOutput,
  });

  focusTarget.focus();
  controller.open({ title: "Test", text: "Body" });
  controller.close();
  dialogEl.dispatchEvent(new dom.window.Event("close"));
  assert.equal(document.activeElement, focusTarget);

  nameMarker.click();
  const closeButton = dialogEl.querySelector("[data-dialog-close]");
  closeButton.click();
  assert.equal(nameMarker.getAttribute("aria-expanded"), "false");

  cleanupDom(dom);
});

test("Handles empty targets and missing dialog APIs", () => {
  const dom = createDom(baseDom);
  const document = dom.window.document;
  const resultsOutput = document.querySelector("#resultsOutput");
  const dialogEl = document.querySelector("#markerDialog");
  const dialogBody = document.querySelector("#markerDialogBody");
  const dialogTitle = document.querySelector("#markerDialogTitle");

  dialogBody.setAttribute("tabindex", "-1");
  dialogEl.close = () => {
    dialogEl.open = false;
    dialogEl.removeAttribute("open");
  };
  dialogEl.getBoundingClientRect = () => ({
    top: 0,
    bottom: 80,
    left: 0,
    right: 200,
    width: 200,
    height: 80,
  });

  const marker = document.createElement("span");
  marker.setAttribute("data-pronoun", "Sie/ihr");
  marker.setAttribute("data-pronoun-form", "Nominativ");
  marker.setAttribute("role", "button");
  marker.setAttribute("tabindex", "0");
  marker.getBoundingClientRect = () => ({
    top: 20,
    bottom: 40,
    left: 20,
    width: 20,
    height: 20,
    right: 40,
  });
  resultsOutput.appendChild(marker);

  const controller = initMarkerDialog({
    dialog: dialogEl,
    dialogBody,
    dialogTitle,
    resultsOutput,
  });

  document.body.dispatchEvent(
    new dom.window.Event("pointerdown", { bubbles: true }),
  );
  controller.close();
  dom.window.dispatchEvent(new dom.window.Event("resize"));
  resultsOutput.dispatchEvent(new dom.window.Event("click", { bubbles: true }));
  resultsOutput.dispatchEvent(
    new dom.window.KeyboardEvent("keydown", { key: "x", bubbles: true }),
  );
  resultsOutput.dispatchEvent(
    new dom.window.KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
  );

  controller.open({ title: "Fallback", text: "Body", trigger: marker });
  assert.equal(dialogEl.getAttribute("open"), "true");
  dialogEl.dispatchEvent(
    new dom.window.Event("pointerdown", { bubbles: true }),
  );
  assert.equal(dialogEl.getAttribute("open"), "true");

  dialogEl.open = false;
  controller.close();
  assert.equal(dialogEl.hasAttribute("open"), false);

  cleanupDom(dom);
});

test("Positions below when space is available", () => {
  const dom = createDom(baseDom);
  const document = dom.window.document;
  const resultsOutput = document.querySelector("#resultsOutput");
  const dialogEl = document.querySelector("#markerDialog");
  const dialogBody = document.querySelector("#markerDialogBody");
  const dialogTitle = document.querySelector("#markerDialogTitle");

  dialogBody.setAttribute("tabindex", "-1");
  dialogEl.showModal = () => {
    dialogEl.open = true;
    dialogEl.setAttribute("open", "true");
  };
  dialogEl.getBoundingClientRect = () => ({
    top: 0,
    bottom: 80,
    left: 0,
    right: 200,
    width: 200,
    height: 80,
  });

  const marker = document.createElement("span");
  marker.setAttribute("data-pronoun", "Sie/ihr");
  marker.setAttribute("data-pronoun-form", "Nominativ");
  marker.setAttribute("role", "button");
  marker.setAttribute("tabindex", "0");
  marker.getBoundingClientRect = () => ({
    top: 10,
    bottom: 30,
    left: 40,
    width: 20,
    height: 20,
    right: 60,
  });
  resultsOutput.appendChild(marker);

  dom.window.innerWidth = 320;
  dom.window.innerHeight = 500;

  initMarkerDialog({
    dialog: dialogEl,
    dialogBody,
    dialogTitle,
    resultsOutput,
  });

  marker.click();
  assert.equal(dialogEl.dataset.placement, "bottom");

  cleanupDom(dom);
});

test("Prefers below when it has more space than above", () => {
  const dom = createDom(baseDom);
  const document = dom.window.document;
  const resultsOutput = document.querySelector("#resultsOutput");
  const dialogEl = document.querySelector("#markerDialog");
  const dialogBody = document.querySelector("#markerDialogBody");
  const dialogTitle = document.querySelector("#markerDialogTitle");

  dialogBody.setAttribute("tabindex", "-1");
  dialogEl.showModal = () => {
    dialogEl.open = true;
    dialogEl.setAttribute("open", "true");
  };
  dialogEl.getBoundingClientRect = () => ({
    top: 0,
    bottom: 120,
    left: 0,
    right: 200,
    width: 200,
    height: 120,
  });

  const marker = document.createElement("span");
  marker.setAttribute("data-pronoun", "Sie/ihr");
  marker.setAttribute("data-pronoun-form", "Nominativ");
  marker.setAttribute("role", "button");
  marker.setAttribute("tabindex", "0");
  marker.getBoundingClientRect = () => ({
    top: 10,
    bottom: 30,
    left: 40,
    width: 20,
    height: 20,
    right: 60,
  });
  resultsOutput.appendChild(marker);

  dom.window.innerWidth = 320;
  dom.window.innerHeight = 200;

  initMarkerDialog({
    dialog: dialogEl,
    dialogBody,
    dialogTitle,
    resultsOutput,
  });

  marker.click();
  assert.equal(dialogEl.dataset.placement, "bottom");

  cleanupDom(dom);
});

test("Opens on space key activation", () => {
  const dom = createDom(baseDom);
  const document = dom.window.document;
  const resultsOutput = document.querySelector("#resultsOutput");
  const dialogEl = document.querySelector("#markerDialog");
  const dialogBody = document.querySelector("#markerDialogBody");
  const dialogTitle = document.querySelector("#markerDialogTitle");

  dialogBody.setAttribute("tabindex", "-1");
  dialogEl.showModal = () => {
    dialogEl.open = true;
    dialogEl.setAttribute("open", "true");
  };
  dialogEl.getBoundingClientRect = () => ({
    top: 0,
    bottom: 80,
    left: 0,
    right: 200,
    width: 200,
    height: 80,
  });

  const marker = document.createElement("span");
  marker.setAttribute("data-pronoun", "Sie/ihr");
  marker.setAttribute("data-pronoun-form", "Nominativ");
  marker.setAttribute("role", "button");
  marker.setAttribute("tabindex", "0");
  marker.getBoundingClientRect = () => ({
    top: 20,
    bottom: 40,
    left: 20,
    width: 20,
    height: 20,
    right: 40,
  });
  resultsOutput.appendChild(marker);

  initMarkerDialog({
    dialog: dialogEl,
    dialogBody,
    dialogTitle,
    resultsOutput,
  });

  marker.dispatchEvent(
    new dom.window.KeyboardEvent("keydown", { key: " ", bubbles: true }),
  );

  assert.equal(dialogTitle.textContent, "Pronomen-Info");

  cleanupDom(dom);
});

test("Ignores missing last focus target", () => {
  const dom = createDom(baseDom);
  const document = dom.window.document;
  const resultsOutput = document.querySelector("#resultsOutput");
  const dialogEl = document.querySelector("#markerDialog");
  const dialogBody = document.querySelector("#markerDialogBody");
  const dialogTitle = document.querySelector("#markerDialogTitle");

  dialogBody.setAttribute("tabindex", "-1");
  dialogEl.showModal = () => {
    dialogEl.open = true;
    dialogEl.setAttribute("open", "true");
  };
  dialogEl.getBoundingClientRect = () => ({
    top: 0,
    bottom: 80,
    left: 0,
    right: 200,
    width: 200,
    height: 80,
  });

  const focusTarget = document.createElement("button");
  focusTarget.textContent = "Focus";
  document.body.appendChild(focusTarget);
  focusTarget.focus();
  focusTarget.remove();

  const marker = document.createElement("span");
  marker.setAttribute("data-pronoun", "Sie/ihr");
  marker.setAttribute("data-pronoun-form", "Nominativ");
  marker.setAttribute("role", "button");
  marker.setAttribute("tabindex", "0");
  marker.getBoundingClientRect = () => ({
    top: 20,
    bottom: 40,
    left: 20,
    width: 20,
    height: 20,
    right: 40,
  });
  resultsOutput.appendChild(marker);

  initMarkerDialog({
    dialog: dialogEl,
    dialogBody,
    dialogTitle,
    resultsOutput,
  });

  marker.click();
  dialogEl.dispatchEvent(new dom.window.Event("close"));

  cleanupDom(dom);
});


test("Uses default name source and falls back to user", () => {
  const dom = createDom(baseDom);
  const document = dom.window.document;
  const resultsOutput = document.querySelector("#resultsOutput");
  const dialogEl = document.querySelector("#markerDialog");
  const dialogBody = document.querySelector("#markerDialogBody");
  const dialogTitle = document.querySelector("#markerDialogTitle");

  dialogBody.setAttribute("tabindex", "-1");
  dialogEl.showModal = () => {
    dialogEl.open = true;
    dialogEl.setAttribute("open", "true");
  };
  dialogEl.close = () => {
    dialogEl.open = false;
    dialogEl.removeAttribute("open");
  };
  dialogEl.getBoundingClientRect = () => ({
    top: 0,
    bottom: 80,
    left: 0,
    right: 200,
    width: 200,
    height: 80,
  });

  resultsOutput.dataset.nameSourceDefault = "auto";

  const nameMarker = document.createElement("span");
  nameMarker.setAttribute("data-name", "true");
  nameMarker.setAttribute("role", "button");
  nameMarker.setAttribute("tabindex", "0");
  nameMarker.getBoundingClientRect = () => ({
    top: 20,
    bottom: 40,
    left: 20,
    width: 20,
    height: 20,
    right: 40,
  });
  resultsOutput.appendChild(nameMarker);

  const controller = initMarkerDialog({
    dialog: dialogEl,
    dialogBody,
    dialogTitle,
    resultsOutput,
  });

  nameMarker.click();
  assert.equal(dialogTitle.textContent, "Namens-Info");
  assert.ok(dialogBody.textContent.includes("Zufällig"));

  controller.close();
  resultsOutput.dataset.nameSourceDefault = "";
  nameMarker.click();
  assert.ok(dialogBody.textContent.includes("Von dir eingegeben"));

  cleanupDom(dom);
});
