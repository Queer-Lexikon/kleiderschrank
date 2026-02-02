import { $, $$ } from "./app/dom.js";
import {
  ALERT_MIN_NAME,
  REMOVE_NAME_LABEL,
  NAME_PLACEHOLDER,
  MAX_NAMES,
  SHARE_COPY_BUTTON_LABEL,
  SHARE_COPY_PROMPT_LABEL,
  SHARE_COPY_SUCCESS,
  SHARE_LAST_NAME_NOTICE,
  LISTEN_LABEL,
  STOP_LISTEN_LABEL,
} from "./app/constants.js";
import {
  populatePronounCheckboxes,
  getSelectedPronounSets,
} from "./app/pronouns.js";
import { parseNames, getNameKey, buildRandomPreviewName } from "./app/names.js";
import { chooseDifferent } from "./app/random.js";
import { renderResults } from "./app/render.js";
import { createTtsController } from "./app/tts.js";
import { createMobileIconRow } from "./app/mobileIconRow.js";

import SampleTexts from "../data/SampleTexts.js";

// Main entrypoint: wire UI, sync state, and render output.
const populateTextSelector = (select) => {
  Object.entries(SampleTexts).forEach(([key, entry]) => {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = entry.title || key;
    select.appendChild(option);
  });
};

const createElements = () => ({
  namesContainer: $("#namesContainer"),
  salutationSelect: $("#salutation"),
  textSelector: $("#textSelector"),
  pronounContainer: $("#pronounContainer"),
  randomSingleRadio: $("#randomSingle"),
  randomEachRadio: $("#randomEach"),
  randomModeContainer: $(".random-mode"),
  shareButton: $("#shareButton"),
  shareSheetButton: $("#shareSheetButton"),
  markerToggle: $("#markerToggle"),
  rerunButton: $("#rerunButton"),
  resultsOutput: $("#resultsOutput"),
});

// Track the last single-mode choices so reruns can pick a different one.
const createState = () => ({
  lastSinglePronounLabel: null,
  lastSingleNameKey: null,
  isHydrating: true,
});

window.addEventListener("DOMContentLoaded", () => {
  const elements = createElements();
  const state = createState();
  const mobileMediaQuery = window.matchMedia("(max-width: 60rem)");
  let ttsController = null;
  let mobileIconRow = null;

  populateTextSelector(elements.textSelector);
  populatePronounCheckboxes(elements.pronounContainer);

  const getNameInputs = () => $$(".name-input", elements.namesContainer);
  const getNameRows = () => $$(".name-row", elements.namesContainer);

  const recordSingleSelection = (renderInfo, randomMode) => {
    if (randomMode !== "single") {
      return;
    }
    if (renderInfo && renderInfo.pronounSet) {
      state.lastSinglePronounLabel = renderInfo.pronounSet.bezeichnung;
    }
    if (renderInfo && renderInfo.selectedName) {
      state.lastSingleNameKey = getNameKey(renderInfo.selectedName);
    }
  };

  const getListenButton = () => $(".results-listen");

  const getHeadingRow = () => $(".results-heading", elements.resultsOutput);

  const updateListenButton = () => {
    const button = getListenButton();
    if (!button) {
      return;
    }
    const { available, speaking } = ttsController
      ? ttsController.getState()
      : { available: false, speaking: false };
    button.classList.toggle("is-hidden", !available);
    const label = speaking ? STOP_LISTEN_LABEL : LISTEN_LABEL;
    button.setAttribute("aria-label", label);
    button.setAttribute("title", label);
    const icon = $("img", button);
    if (icon) {
      icon.src = speaking ? "img/fas-stop.svg" : "img/fas-listen.svg";
    }
  };

  const updateMobileIconLayout = () => {
    if (mobileIconRow) {
      mobileIconRow.update();
    }
  };

  const clearListenButtons = () => {
    $$(".results-listen").forEach((button) => button.remove());
  };

  const toggleSpeaking = () => {
    if (!ttsController) {
      return;
    }
    const paragraph = $("p", elements.resultsOutput);
    const text = paragraph ? paragraph.textContent.trim() : "";
    ttsController.toggle(text);
  };

  const wireListenButton = (listenButton) => {
    if (!listenButton) {
      return;
    }
    listenButton.addEventListener("click", toggleSpeaking);
    updateListenButton();
    updateMobileIconLayout();
  };

  const clearUrlParams = () => {
    if (state.isHydrating) {
      return;
    }
    const url = new URL(window.location.href);
    if (!url.search) {
      return;
    }
    url.search = "";
    window.history.replaceState({}, "", url.toString());
  };

  // Keep the label associated to the first name field for accessibility reasons
  const syncNameLabelTarget = () => {
    const inputs = getNameInputs();
    inputs.forEach((input, index) => {
      if (index === 0) {
        input.id = "names";
        input.removeAttribute("aria-label");
        return;
      }
      if (input.id === "names") {
        input.removeAttribute("id");
      }
      input.setAttribute("aria-label", "Weiterer Name");
    });
  };

  const updateNameButtons = () => {
    const rows = getNameRows();
    rows.forEach((row) => {
      const removeButton = $(".remove-name", row);
      if (removeButton) {
        removeButton.classList.toggle("is-hidden", rows.length === 1);
      }
    });

    syncNameLabelTarget();
  };

  const removeNameRow = (row, input) => {
    const inputsBefore = getNameInputs();
    const currentIndex = inputsBefore.indexOf(input);
    row.remove();
    updateNameButtons();
    triggerGenerate();
    const inputsAfter = getNameInputs();
    if (inputsAfter.length === 0) {
      return;
    }
    const nextIndex = Math.min(currentIndex, inputsAfter.length - 1);
    inputsAfter[nextIndex].focus();
  };

  const createNameRow = (value = "") => {
    const row = document.createElement("div");
    row.className = "name-row";

    const input = document.createElement("input");
    input.type = "text";
    input.className = "name-input";
    input.placeholder = NAME_PLACEHOLDER;
    input.value = value;
    input.addEventListener("input", triggerGenerate);
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        addNameRow();
        return;
      }
      if (event.key !== "Backspace") {
        return;
      }
      if (input.value.trim().length > 0) {
        return;
      }
      if (getNameRows().length === 1) {
        return;
      }
      event.preventDefault();
      removeNameRow(row, input);
    });

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "icon-button remove-name";
    removeButton.setAttribute("aria-label", REMOVE_NAME_LABEL);
    removeButton.setAttribute("title", REMOVE_NAME_LABEL);
    removeButton.innerHTML =
      '<img src="img/fas-minus.svg" alt="" aria-hidden="true" />';
    removeButton.addEventListener("click", () => {
      removeNameRow(row, input);
    });

    row.appendChild(input);
    row.appendChild(removeButton);

    return row;
  };

  function addNameRow(value = "") {
    if (getNameRows().length >= MAX_NAMES) {
      return;
    }
    const row = createNameRow(value);
    elements.namesContainer.appendChild(row);
    updateNameButtons();
    const newInput = $(".name-input", row);
    if (newInput) {
      newInput.focus();
    }
  }

  const ensureNameRows = () => {
    if (getNameRows().length > 0) {
      return;
    }
    const existingInputs = getNameInputs();
    if (existingInputs.length === 0) {
      addNameRow();
      return;
    }
    const existingValue = existingInputs[0].value;
    elements.namesContainer.innerHTML = "";
    addNameRow(existingValue);
  };

  // Build a shareable URL snapshot of the current UI state.
  const buildShareUrl = () => {
    const params = new URLSearchParams();
    const namesValue = getNameInputs()
      .map((input) => input.value.trim())
      .filter((value) => value)
      .join(", ");
    if (namesValue) {
      params.set("names", namesValue);
    }

    if (elements.salutationSelect.value) {
      params.set("salutation", elements.salutationSelect.value);
    }

    if (elements.textSelector.value) {
      params.set("text", elements.textSelector.value);
    }

    const selectedPronouns = $$(
      'input[type="checkbox"]:checked',
      elements.pronounContainer,
    )
      .map((box) => box.value)
      .join(",");

    if (selectedPronouns) {
      params.set("pronouns", selectedPronouns);
    }

    params.set(
      "random",
      elements.randomSingleRadio.checked ? "single" : "each",
    );
    params.set("markers", elements.markerToggle.checked ? "on" : "off");

    const url = new URL(window.location.href);
    url.search = params.toString();
    url.hash = "resultsOutput";
    return url.toString();
  };

  // Apply URL state to the UI on initial load.
  const applyUrlState = () => {
    const params = new URLSearchParams(window.location.search);

    const namesValue = params.get("names");
    if (namesValue !== null) {
      const parts = namesValue
        .split(",")
        .map((value) => value.trim())
        .filter((value) => value);
      if (parts.length > 0) {
        elements.namesContainer.innerHTML = "";
        parts.slice(0, MAX_NAMES).forEach((value) => {
          addNameRow(value);
        });
      }
    }

    const salutationValue = params.get("salutation");
    if (salutationValue !== null) {
      elements.salutationSelect.value = salutationValue;
    }

    const textValue = params.get("text");
    if (
      textValue !== null &&
      elements.textSelector.querySelector(
        `option[value="${CSS.escape(textValue)}"]`,
      )
    ) {
      elements.textSelector.value = textValue;
    }

    const pronounValue = params.get("pronouns");
    if (pronounValue !== null) {
      const selectedSet = new Set(
        pronounValue.split(",").map((value) => value.trim()),
      );
      $$('input[type="checkbox"]', elements.pronounContainer).forEach(
        (checkbox) => {
          checkbox.checked = selectedSet.has(checkbox.value);
        },
      );
    }

    const randomValue = params.get("random");
    if (randomValue === "each") {
      elements.randomEachRadio.checked = true;
    } else if (randomValue === "single") {
      elements.randomSingleRadio.checked = true;
    }

    const markerValue = params.get("markers");
    if (markerValue === "off") {
      elements.markerToggle.checked = false;
    } else if (markerValue === "on") {
      elements.markerToggle.checked = true;
    }
  };

  const hasProvidedLastName = () =>
    getNameInputs().some((input) =>
      input.value
        .split(",")
        .some((value) => value.trim().split(/\s+/).filter(Boolean).length > 1),
    );

  const updateRandomModeVisibility = () => {
    const selectedCount = $$(
      'input[type="checkbox"]:checked',
      elements.pronounContainer,
    ).length;
    const filledNames = getNameInputs().filter(
      (input) => input.value.trim().length > 0,
    ).length;

    if (selectedCount > 1 || filledNames > 1) {
      elements.randomModeContainer.classList.remove("is-hidden");
      updateMobileIconLayout();
      return;
    }

    elements.randomModeContainer.classList.add("is-hidden");
    elements.randomSingleRadio.checked = true;
    updateMobileIconLayout();
  };

  const updateMarkerStyle = () => {
    elements.resultsOutput.classList.toggle(
      "is-plain",
      !elements.markerToggle.checked,
    );
    clearUrlParams();
  };

  // Render a sample when no names are entered yet.
  const renderRandomPreview = () => {
    if (ttsController) {
      ttsController.stop();
    }
    clearListenButtons();
    const hasNames = getNameInputs().some(
      (input) => input.value.trim().length > 0,
    );
    if (hasNames) {
      return;
    }
    const previewName = buildRandomPreviewName(state.lastSingleNameKey);

    const { available, speaking } = ttsController
      ? ttsController.getState()
      : { available: false, speaking: false };
    const renderInfo = renderResults({
      resultsContainer: elements.resultsOutput,
      names: [previewName],
      pronounSets: getSelectedPronounSets(elements.pronounContainer),
      salutation: elements.salutationSelect.value,
      textKey: elements.textSelector.value,
      randomMode: elements.randomSingleRadio.checked ? "single" : "each",
      ttsAvailable: available,
      ttsSpeaking: speaking,
    });
    recordSingleSelection(
      renderInfo,
      elements.randomSingleRadio.checked ? "single" : "each",
    );
    wireListenButton(renderInfo.listenButton);
  };

  const selectRandomTextIfUnset = () => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("text")) {
      return;
    }
    if (elements.textSelector.options.length > 0) {
      const randomIndex = Math.floor(
        Math.random() * elements.textSelector.options.length,
      );
      elements.textSelector.selectedIndex = randomIndex;
    }
  };

  // Core render path for all user-driven changes.
  const triggerGenerate = () => {
    if (ttsController) {
      ttsController.stop();
    }
    clearListenButtons();
    clearUrlParams();
    const hasNames = getNameInputs().some(
      (input) => input.value.trim().length > 0,
    );

    updateRandomModeVisibility();

    if (!hasNames) {
      renderRandomPreview();
      return;
    }

    const parsedNames = parseNames(getNameInputs());
    if (parsedNames.length === 0) {
      alert(ALERT_MIN_NAME);
      return;
    }

    const { available, speaking } = ttsController
      ? ttsController.getState()
      : { available: false, speaking: false };
    const renderInfo = renderResults({
      resultsContainer: elements.resultsOutput,
      names: parsedNames,
      pronounSets: getSelectedPronounSets(elements.pronounContainer),
      salutation: elements.salutationSelect.value,
      textKey: elements.textSelector.value,
      randomMode: elements.randomSingleRadio.checked ? "single" : "each",
      ttsAvailable: available,
      ttsSpeaking: speaking,
    });
    recordSingleSelection(
      renderInfo,
      elements.randomSingleRadio.checked ? "single" : "each",
    );
    wireListenButton(renderInfo.listenButton);
  };

  const handleRandomText = () => {
    const optionCount = elements.textSelector.options.length;
    if (optionCount === 0) {
      return;
    }
    if (optionCount === 1) {
      elements.textSelector.selectedIndex = 0;
      return;
    }
    const currentIndex = elements.textSelector.selectedIndex;
    let randomIndex = currentIndex;
    while (randomIndex === currentIndex) {
      randomIndex = Math.floor(Math.random() * optionCount);
    }
    elements.textSelector.selectedIndex = randomIndex;
    triggerGenerate();
  };

  const handleShareSheet = async () => {
    try {
      const includesLastName = hasProvidedLastName();
      if (includesLastName) {
        alert(SHARE_LAST_NAME_NOTICE);
      }
      window.history.replaceState({}, "", buildShareUrl());
      await navigator.share({
        title: document.title,
        url: buildShareUrl(),
      });
    } catch (error) {}
  };

  const handleShareCopy = async () => {
    const url = buildShareUrl();
    const includesLastName = hasProvidedLastName();
    try {
      if (includesLastName) {
        alert(SHARE_LAST_NAME_NOTICE);
      }
      window.history.replaceState({}, "", buildShareUrl());
      await navigator.clipboard.writeText(url);
      elements.shareButton.textContent = SHARE_COPY_SUCCESS;
      elements.shareButton.classList.add("is-copied");
      setTimeout(() => {
        elements.shareButton.textContent = SHARE_COPY_BUTTON_LABEL;
        elements.shareButton.classList.remove("is-copied");
      }, 1500);
    } catch (error) {
      if (includesLastName) {
        alert(SHARE_LAST_NAME_NOTICE);
      }
      window.history.replaceState({}, "", buildShareUrl());
      window.prompt(SHARE_COPY_PROMPT_LABEL, url);
    }
  };

  // When in single mode, rerun should pick a different pronoun or name.
  const handleRerun = () => {
    if (ttsController) {
      ttsController.stop();
    }
    clearListenButtons();
    updateRandomModeVisibility();
    const randomModeVisible =
      !elements.randomModeContainer.classList.contains("is-hidden");
    if (!randomModeVisible || !elements.randomSingleRadio.checked) {
      triggerGenerate();
      return;
    }

    const hasNames = getNameInputs().some(
      (input) => input.value.trim().length > 0,
    );
    const selectedPronouns = getSelectedPronounSets(elements.pronounContainer);
    const canChangePronoun =
      selectedPronouns.length > 1 && state.lastSinglePronounLabel;

    let names = [];
    if (hasNames) {
      names = parseNames(getNameInputs());
    } else {
      names = [buildRandomPreviewName(state.lastSingleNameKey)];
    }

    let pronounSets = selectedPronouns;
    if (canChangePronoun) {
      const nextPronounSet = chooseDifferent(
        selectedPronouns,
        state.lastSinglePronounLabel,
        (set) => set.bezeichnung,
      );
      pronounSets = [nextPronounSet];
    } else if (names.length > 1 && state.lastSingleNameKey) {
      const nextName = chooseDifferent(
        names,
        state.lastSingleNameKey,
        getNameKey,
      );
      names = [nextName];
    } else if (!hasNames) {
      names = [buildRandomPreviewName(state.lastSingleNameKey)];
    }

    const { available, speaking } = ttsController
      ? ttsController.getState()
      : { available: false, speaking: false };
    const renderInfo = renderResults({
      resultsContainer: elements.resultsOutput,
      names,
      pronounSets,
      salutation: elements.salutationSelect.value,
      textKey: elements.textSelector.value,
      randomMode: "single",
      ttsAvailable: available,
      ttsSpeaking: speaking,
    });
    recordSingleSelection(renderInfo, "single");
    wireListenButton(renderInfo.listenButton);
  };

  const wireEvents = () => {
    $("#randomTextButton").addEventListener("click", handleRandomText);
    elements.shareSheetButton.addEventListener("click", handleShareSheet);
    elements.shareButton.addEventListener("click", handleShareCopy);
    elements.markerToggle.addEventListener("change", updateMarkerStyle);

    elements.salutationSelect.addEventListener("change", triggerGenerate);
    elements.textSelector.addEventListener("change", triggerGenerate);
    elements.pronounContainer.addEventListener("change", () => {
      updateRandomModeVisibility();
      triggerGenerate();
    });
    elements.randomSingleRadio.addEventListener("change", triggerGenerate);
    elements.randomEachRadio.addEventListener("change", triggerGenerate);
    elements.rerunButton.addEventListener("click", handleRerun);
  };

  const applyShareAvailability = () => {
    if (!navigator.share) {
      elements.shareSheetButton.classList.add("is-hidden");
      elements.shareButton.classList.add("is-full");
    }
  };

  const init = () => {
    ensureNameRows();
    applyUrlState();
    updateRandomModeVisibility();
    updateMarkerStyle();
    selectRandomTextIfUnset();
    renderRandomPreview();
    ttsController = createTtsController({
      onStatusChange: () => {
        updateListenButton();
        updateMobileIconLayout();
      },
    });
    ttsController.init();
    mobileIconRow = createMobileIconRow({
      mobileQuery: mobileMediaQuery,
      resultsControls: $(".results-controls"),
      randomModeContainer: elements.randomModeContainer,
      randomTextButton: $("#randomTextButton"),
      rerunButton: elements.rerunButton,
      getListenButton,
      getHeadingRow,
      getSelectRow: () => $(".select-row"),
      getRandomModeRow: () => $(".random-mode-row"),
    });
    mobileIconRow.attach();
    wireEvents();
    applyShareAvailability();

    if (getNameInputs().some((input) => input.value.trim().length > 0)) {
      triggerGenerate();
    }
    updateMobileIconLayout();
    state.isHydrating = false;
  };

  init();
});
