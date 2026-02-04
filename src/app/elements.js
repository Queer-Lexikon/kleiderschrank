import { $ } from "./dom.js";

/**
 * Capture core UI element references.
 * @returns {object}
 */
export function createElements() {
  return {
    namesContainer: $("#namesContainer"),
    salutationSelect: $("#salutation"),
    textSelector: $("#textSelector"),
    randomTextButton: $("#randomTextButton"),
    pronounContainer: $("#pronounContainer"),
    randomSingleRadio: $("#randomSingle"),
    randomEachRadio: $("#randomEach"),
    randomModeContainer: $(".random-mode"),
    resultsControls: $(".results-controls"),
    shareButton: $("#shareButton"),
    shareSheetButton: $("#shareSheetButton"),
    markerToggle: $("#markerToggle"),
    rerunButton: $("#rerunButton"),
    resultsOutput: $("#resultsOutput"),
    markerDialog: $("#markerDialog"),
    markerDialogBody: $("#markerDialogBody"),
    markerDialogTitle: $("#markerDialogTitle"),
  };
}
