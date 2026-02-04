/**
 * Tests for share UI helpers.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { createDom, cleanupDom } from "./helpers/dom.js";
import {
  SHARE_COPY_BUTTON_LABEL,
  SHARE_COPY_SUCCESS,
} from "../src/app/constants.js";
import {
  applyShareAvailability,
  getShareState,
  hasProvidedLastName,
  setShareCopiedState,
} from "../src/features/share.js";

function buildShareButtons(document) {
  const shareSheetButton = document.createElement("button");
  const shareSheetLabel = document.createElement("span");
  shareSheetLabel.className = "share-button__label";
  shareSheetButton.appendChild(shareSheetLabel);

  const shareButton = document.createElement("button");
  const shareLabel = document.createElement("span");
  shareLabel.className = "share-button__label";
  shareButton.appendChild(shareLabel);

  return { shareSheetButton, shareButton, shareLabel };
}

test("Detects when any name input includes a last name", () => {
  const dom = createDom();
  const inputA = dom.window.document.createElement("input");
  inputA.value = "Alex";
  const inputB = dom.window.document.createElement("input");
  inputB.value = "Sam Lee";

  assert.equal(hasProvidedLastName([inputA]), false);
  assert.equal(hasProvidedLastName([inputA, inputB]), true);

  cleanupDom(dom);
});

test("Builds share state with declension only when applicable", () => {
  const dom = createDom();
  const document = dom.window.document;
  const nameInput = document.createElement("input");
  nameInput.value = "Alex";

  const salutationSelect = document.createElement("select");
  const salutationOption = document.createElement("option");
  salutationOption.value = "formal";
  salutationOption.selected = true;
  salutationSelect.appendChild(salutationOption);

  const textSelector = document.createElement("select");
  const textOption = document.createElement("option");
  textOption.value = "declension";
  textOption.selected = true;
  textSelector.appendChild(textOption);

  const pronounContainer = document.createElement("div");
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.value = "they";
  checkbox.checked = true;
  pronounContainer.appendChild(checkbox);

  const markerToggle = document.createElement("input");
  markerToggle.type = "checkbox";
  markerToggle.checked = false;

  const withDeclension = getShareState({
    nameInputs: [nameInput],
    salutationSelect,
    textSelector,
    pronounContainer,
    randomMode: true,
    markerToggle,
    declensionTabId: "tab-1",
    isDeclensionText: () => true,
  });

  assert.deepEqual(withDeclension, {
    names: ["Alex"],
    salutation: "formal",
    textKey: "declension",
    pronouns: ["they"],
    randomMode: true,
    markers: "off",
    declensionTabId: "tab-1",
  });

  const withoutDeclension = getShareState({
    nameInputs: [nameInput],
    salutationSelect,
    textSelector,
    pronounContainer,
    randomMode: false,
    markerToggle,
    declensionTabId: "tab-1",
    isDeclensionText: () => false,
  });

  assert.equal(withoutDeclension.declensionTabId, null);

  markerToggle.checked = true;
  const withoutTabId = getShareState({
    nameInputs: [nameInput],
    salutationSelect,
    textSelector,
    pronounContainer,
    randomMode: false,
    markerToggle,
    declensionTabId: "",
    isDeclensionText: () => true,
  });

  assert.equal(withoutTabId.markers, "on");
  assert.equal(withoutTabId.declensionTabId, null);

  cleanupDom(dom);
});

test("Shows only the share sheet button when available", () => {
  const dom = createDom();
  Object.defineProperty(global, "navigator", {
    value: dom.window.navigator,
    configurable: true,
  });
  Object.defineProperty(global.navigator, "share", {
    value: () => {},
    configurable: true,
  });

  const { shareSheetButton, shareButton } = buildShareButtons(
    dom.window.document,
  );
  applyShareAvailability(shareSheetButton, shareButton);

  assert.equal(shareSheetButton.classList.contains("is-hidden"), false);
  assert.equal(shareSheetButton.classList.contains("is-full"), true);
  assert.equal(shareButton.classList.contains("is-hidden"), true);
  assert.equal(shareButton.classList.contains("is-full"), false);

  cleanupDom(dom);
  delete global.navigator;
});

test("Shows only the copy link button when share sheet is unavailable", () => {
  const dom = createDom();
  Object.defineProperty(global, "navigator", {
    value: dom.window.navigator,
    configurable: true,
  });
  Object.defineProperty(global.navigator, "share", {
    value: undefined,
    configurable: true,
  });
  delete global.navigator.share;

  const { shareSheetButton, shareButton } = buildShareButtons(
    dom.window.document,
  );
  applyShareAvailability(shareSheetButton, shareButton);

  assert.equal(shareSheetButton.classList.contains("is-hidden"), true);
  assert.equal(shareSheetButton.classList.contains("is-full"), false);
  assert.equal(shareButton.classList.contains("is-hidden"), false);
  assert.equal(shareButton.classList.contains("is-full"), true);

  cleanupDom(dom);
  delete global.navigator;
});

test("Temporarily shows the copied state on the share button", async () => {
  const dom = createDom();
  const document = dom.window.document;
  const button = document.createElement("button");
  const label = document.createElement("span");
  label.className = "share-button__label";
  label.textContent = SHARE_COPY_BUTTON_LABEL;
  button.appendChild(label);

  setShareCopiedState(button, 0);

  assert.equal(label.textContent, SHARE_COPY_SUCCESS);
  assert.equal(button.classList.contains("is-copied"), true);

  await new Promise((resolve) => setTimeout(resolve, 0));

  assert.equal(label.textContent, SHARE_COPY_BUTTON_LABEL);
  assert.equal(button.classList.contains("is-copied"), false);

  cleanupDom(dom);
});

test("Updates button text when no share label is present", async () => {
  const dom = createDom();
  const document = dom.window.document;
  const button = document.createElement("button");
  button.textContent = SHARE_COPY_BUTTON_LABEL;

  setShareCopiedState(button, 0);

  assert.equal(button.textContent, SHARE_COPY_SUCCESS);
  assert.equal(button.classList.contains("is-copied"), true);

  await new Promise((resolve) => setTimeout(resolve, 0));

  assert.equal(button.textContent, SHARE_COPY_BUTTON_LABEL);
  assert.equal(button.classList.contains("is-copied"), false);

  cleanupDom(dom);
});
