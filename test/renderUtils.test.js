/**
 * Tests for random mode visibility logic.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { createDom, cleanupDom } from "./helpers/dom.js";
import {
  getRandomMode,
  getTtsState,
  updateMobileIconLayout,
  updateListenButton,
  toggleSpeaking,
  wireListenButton,
  resetResultsUi,
  renderOutput,
  recordSingleSelection,
  updateRandomModeVisibility,
  clearListenButtons,
} from "../src/flows/renderUtils.js";
import { allPronounSets } from "../src/features/pronouns.js";

function buildCtx(dom) {
  const document = dom.window.document;
  const pronounContainer = document.createElement("div");
  const checkboxMain = document.createElement("input");
  checkboxMain.type = "checkbox";
  checkboxMain.value = "0";
  pronounContainer.appendChild(checkboxMain);

  const checkboxRecommended = document.createElement("input");
  checkboxRecommended.type = "checkbox";
  checkboxRecommended.value = "0";
  pronounContainer.appendChild(checkboxRecommended);

  const checkboxOther = document.createElement("input");
  checkboxOther.type = "checkbox";
  checkboxOther.value = "1";
  pronounContainer.appendChild(checkboxOther);

  const randomModeContainer = document.createElement("div");
  randomModeContainer.classList.add("is-hidden");

  const randomSingleRadio = document.createElement("input");
  randomSingleRadio.type = "radio";
  randomSingleRadio.checked = true;

  const textSelector = document.createElement("select");
  const option = document.createElement("option");
  option.value = "default";
  option.selected = true;
  textSelector.appendChild(option);

  const nameList = { container: document.createElement("div") };

  return {
    elements: {
      pronounContainer,
      randomModeContainer,
      randomSingleRadio,
      textSelector,
    },
    nameList,
    mobileIconRow: null,
    checkboxMain,
    checkboxRecommended,
    checkboxOther,
  };
}

test("Keeps random mode hidden for duplicate selections", () => {
  const dom = createDom();
  const ctx = buildCtx(dom);

  ctx.checkboxMain.checked = true;
  ctx.checkboxRecommended.checked = true;

  updateRandomModeVisibility(ctx);
  assert.ok(ctx.elements.randomModeContainer.classList.contains("is-hidden"));

  cleanupDom(dom);
});

test("Shows random mode for distinct selections", () => {
  const dom = createDom();
  const ctx = buildCtx(dom);

  ctx.checkboxMain.checked = true;
  ctx.checkboxOther.checked = true;

  updateRandomModeVisibility(ctx);
  assert.equal(
    ctx.elements.randomModeContainer.classList.contains("is-hidden"),
    false,
  );

  cleanupDom(dom);
});

test("Removes listen buttons from output and controls", () => {
  const dom = createDom();
  const document = dom.window.document;
  const resultsOutput = document.createElement("div");
  const resultsControls = document.createElement("div");

  const outputButton = document.createElement("button");
  outputButton.className = "results-listen";
  resultsOutput.appendChild(outputButton);

  const controlButton = document.createElement("button");
  controlButton.className = "results-listen";
  resultsControls.appendChild(controlButton);

  clearListenButtons(resultsOutput, resultsControls);

  assert.equal(resultsOutput.querySelectorAll(".results-listen").length, 0);
  assert.equal(resultsControls.querySelectorAll(".results-listen").length, 0);

  cleanupDom(dom);
});

test("Derives random mode from the selected radio option", () => {
  const dom = createDom();
  const document = dom.window.document;
  const randomSingleRadio = document.createElement("input");
  randomSingleRadio.type = "radio";
  randomSingleRadio.checked = true;

  const randomEachRadio = document.createElement("input");
  randomEachRadio.type = "radio";
  randomEachRadio.checked = false;

  assert.equal(
    getRandomMode({ randomSingleRadio, randomEachRadio }),
    "single",
  );

  randomSingleRadio.checked = false;
  randomEachRadio.checked = true;

  assert.equal(getRandomMode({ randomSingleRadio, randomEachRadio }), "each");

  cleanupDom(dom);
});

test("Returns fallback TTS state when the controller is missing", () => {
  assert.deepEqual(getTtsState(null), { available: false, speaking: false });
});

test("Uses the controller TTS state when available", () => {
  const state = { available: true, speaking: true };
  const controller = {
    getState: () => state,
  };
  assert.equal(getTtsState(controller), state);
});

test("Skips mobile icon updates when missing and updates when present", () => {
  updateMobileIconLayout(null);
  let called = 0;
  updateMobileIconLayout({
    update: () => {
      called += 1;
    },
  });
  assert.equal(called, 1);
});

test("No-ops when the listen button is missing", () => {
  updateListenButton({
    ttsController: null,
    getListenButton: () => null,
  });
});

test("Updates listen button label, icon, and visibility", () => {
  const dom = createDom();
  const document = dom.window.document;
  const button = document.createElement("button");
  button.innerHTML = "<img />";
  const controller = {
    getState: () => ({ available: true, speaking: true }),
  };

  updateListenButton({
    ttsController: controller,
    getListenButton: () => button,
  });

  assert.equal(button.classList.contains("is-hidden"), false);
  assert.equal(button.getAttribute("aria-label"), "Vorlesen stoppen");
  assert.equal(button.getAttribute("title"), "Vorlesen stoppen");
  const icon = button.querySelector("img");
  assert.ok(icon?.src.includes("fas-stop.svg"));

  cleanupDom(dom);
});

test("No-ops when the TTS controller is missing", () => {
  const dom = createDom();
  const document = dom.window.document;
  const resultsOutput = document.createElement("div");
  toggleSpeaking({ ttsController: null, resultsOutput });
  cleanupDom(dom);
});

test("Speaks trimmed paragraph text", () => {
  const dom = createDom();
  const document = dom.window.document;
  const resultsOutput = document.createElement("div");
  const paragraph = document.createElement("p");
  paragraph.textContent = " Hallo ";
  resultsOutput.appendChild(paragraph);
  let spoken = null;
  const controller = {
    toggle: (text) => {
      spoken = text;
    },
  };

  toggleSpeaking({ ttsController: controller, resultsOutput });
  assert.equal(spoken, "Hallo");

  cleanupDom(dom);
});

test("Speaks an empty string when no paragraph exists", () => {
  const dom = createDom();
  const document = dom.window.document;
  const resultsOutput = document.createElement("div");
  let spoken = "unset";
  const controller = {
    toggle: (text) => {
      spoken = text;
    },
  };

  toggleSpeaking({ ttsController: controller, resultsOutput });
  assert.equal(spoken, "");

  cleanupDom(dom);
});

test("No-ops when the listen button is missing", () => {
  const dom = createDom();
  const document = dom.window.document;
  const ctx = {
    ttsController: null,
    elements: { resultsOutput: document.createElement("div") },
    getListenButton: () => null,
    mobileIconRow: null,
  };
  wireListenButton(ctx, null);
  cleanupDom(dom);
});

test("Wires listen button clicks and updates layout", () => {
  const dom = createDom();
  const document = dom.window.document;
  const listenButton = document.createElement("button");
  listenButton.innerHTML = "<img />";
  const resultsOutput = document.createElement("div");
  const paragraph = document.createElement("p");
  paragraph.textContent = "Test";
  resultsOutput.appendChild(paragraph);
  let toggled = null;
  let updated = 0;
  const ctx = {
    ttsController: {
      toggle: (text) => {
        toggled = text;
      },
      getState: () => ({ available: true, speaking: false }),
    },
    elements: { resultsOutput },
    getListenButton: () => listenButton,
    mobileIconRow: {
      update: () => {
        updated += 1;
      },
    },
  };

  wireListenButton(ctx, listenButton);
  listenButton.click();

  assert.equal(toggled, "Test");
  assert.equal(updated, 1);

  cleanupDom(dom);
});

test("Resets results UI by closing dialog, stopping TTS, and clearing buttons", () => {
  const dom = createDom();
  const document = dom.window.document;
  const resultsOutput = document.createElement("div");
  const resultsControls = document.createElement("div");
  const button = document.createElement("button");
  button.className = "results-listen";
  resultsOutput.appendChild(button);
  const controlButton = document.createElement("button");
  controlButton.className = "results-listen";
  resultsControls.appendChild(controlButton);
  let closed = 0;
  let stopped = 0;
  const ctx = {
    markerDialog: {
      close: () => {
        closed += 1;
      },
    },
    ttsController: {
      stop: () => {
        stopped += 1;
      },
    },
    elements: { resultsOutput, resultsControls },
  };

  resetResultsUi(ctx);

  assert.equal(closed, 1);
  assert.equal(stopped, 1);
  assert.equal(resultsOutput.querySelectorAll(".results-listen").length, 0);
  assert.equal(resultsControls.querySelectorAll(".results-listen").length, 0);

  cleanupDom(dom);
});

test("Renders non-declension output with TTS disabled", () => {
  const dom = createDom("<div id=\"container\"></div>");
  const document = dom.window.document;
  const resultsOutput = document.querySelector("#container");
  const salutationSelect = document.createElement("select");
  salutationSelect.value = "none";
  const textSelector = document.createElement("select");
  const option = document.createElement("option");
  option.value = "school";
  option.selected = true;
  textSelector.appendChild(option);
  const ctx = {
    elements: { resultsOutput, salutationSelect, textSelector },
    state: { selectedDeclensionTabId: null },
    ttsController: {
      getState: () => ({ available: true, speaking: true }),
    },
  };

  const info = renderOutput(ctx, {
    names: [{ firstName: "Alex", lastName: "" }],
    pronounSets: [allPronounSets[0]],
    randomMode: "single",
    allowTts: false,
  });

  assert.ok(info.listenButton);
  assert.equal(info.listenButton.classList.contains("is-hidden"), true);

  cleanupDom(dom);
});

test("Renders declensions and updates selected tab state", () => {
  const dom = createDom("<div id=\"container\"></div>");
  const document = dom.window.document;
  const resultsOutput = document.querySelector("#container");
  const salutationSelect = document.createElement("select");
  salutationSelect.value = "none";
  const textSelector = document.createElement("select");
  const option = document.createElement("option");
  option.value = "declensions";
  option.selected = true;
  textSelector.appendChild(option);

  const ctx = {
    elements: { resultsOutput, salutationSelect, textSelector },
    state: { selectedDeclensionTabId: null },
    ttsController: {
      getState: () => ({ available: true, speaking: false }),
    },
  };

  renderOutput(ctx, {
    names: [{ firstName: "Alex", lastName: "" }],
    pronounSets: [allPronounSets[0]],
    randomMode: "single",
    includeDeclensionTabs: true,
  });

  const sampleTab = resultsOutput.querySelector(
    "input[type=\"radio\"][name=\"declension-tabs\"]:not(#declension-tab-table)",
  );
  assert.ok(sampleTab);

  sampleTab.dispatchEvent(new dom.window.Event("change", { bubbles: true }));
  assert.equal(ctx.state.selectedDeclensionTabId, sampleTab.id);

  cleanupDom(dom);
});

test("Does not record single selection outside single mode", () => {
  const state = {};
  recordSingleSelection(state, { pronounSet: { bezeichnung: "Test" } }, "each");
  assert.equal(state.lastSinglePronounLabel, undefined);
});

test("Records the last single selection", () => {
  const state = {};
  recordSingleSelection(
    state,
    { pronounSet: { bezeichnung: "Test" }, selectedName: { firstName: "A" } },
    "single",
  );
  assert.equal(state.lastSinglePronounLabel, "Test");
  assert.ok(state.lastSingleNameKey);
});

test("Hides random mode for declension text", () => {
  const dom = createDom();
  const document = dom.window.document;
  const ctx = buildCtx(dom);
  const option = document.createElement("option");
  option.value = "declensions";
  option.selected = true;
  ctx.elements.textSelector.appendChild(option);
  ctx.elements.randomModeContainer.classList.remove("is-hidden");
  ctx.mobileIconRow = { update: () => {} };

  updateRandomModeVisibility(ctx);
  assert.equal(ctx.elements.randomModeContainer.classList.contains("is-hidden"), true);
  assert.equal(ctx.elements.randomSingleRadio.checked, true);

  cleanupDom(dom);
});
