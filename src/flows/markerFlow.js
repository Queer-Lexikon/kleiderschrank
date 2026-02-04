import { clearUrlParamsIfStable } from "./urlUtils.js";

/**
 * Toggle highlighted-marker styles based on the marker checkbox.
 * @param {object} ctx
 */
export function updateMarkerStyle(ctx) {
  ctx.elements.resultsOutput.classList.toggle(
    "is-plain",
    !ctx.elements.markerToggle.checked,
  );
  clearUrlParamsIfStable(ctx.state);
}
