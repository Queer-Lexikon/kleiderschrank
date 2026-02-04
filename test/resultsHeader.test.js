/**
 * Tests for results header rendering.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { createDom, cleanupDom } from "./helpers/dom.js";
import { createResultsHeader } from "../src/features/results/resultsHeader.js";

test("Renders results heading with a listen button", () => {
  const dom = createDom();
  const { headingRow, heading, listenButton } = createResultsHeader({
    title: "Ausgabe",
    ttsAvailable: true,
    ttsSpeaking: false,
    includeListenButton: true,
  });
  assert.equal(heading.textContent, "Ausgabe");
  assert.ok(headingRow.querySelector(".results-listen"));
  assert.equal(listenButton?.getAttribute("aria-label"), "Text vorlesen");
  cleanupDom(dom);
});

test("Omits the listen button when disabled", () => {
  const dom = createDom();
  const { headingRow, listenButton } = createResultsHeader({
    title: "Ausgabe",
    ttsAvailable: false,
    ttsSpeaking: false,
    includeListenButton: false,
  });
  assert.ok(headingRow.querySelector("h2"));
  assert.equal(listenButton, null);
  cleanupDom(dom);
});

test("Handles unavailable or active TTS states", () => {
  const dom = createDom();
  const { listenButton } = createResultsHeader({
    title: "Ausgabe",
    ttsAvailable: false,
    ttsSpeaking: true,
    includeListenButton: true,
  });

  assert.ok(listenButton.classList.contains("is-hidden"));
  assert.equal(listenButton.getAttribute("aria-label"), "Vorlesen stoppen");
  cleanupDom(dom);
});
