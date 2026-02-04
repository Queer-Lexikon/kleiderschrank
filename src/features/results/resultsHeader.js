import { LISTEN_LABEL, STOP_LISTEN_LABEL } from "../../app/constants.js";

/**
 * Build the results heading row and optional listen button.
 * @param {object} params
 * @returns {{headingRow: HTMLElement, heading: HTMLElement, listenButton: HTMLElement|null}}
 */
export function createResultsHeader({
  title,
  ttsAvailable,
  ttsSpeaking,
  includeListenButton = true,
}) {
  const headingRow = document.createElement("div");
  headingRow.className = "results-heading";

  const heading = document.createElement("h2");
  heading.textContent = title;
  headingRow.appendChild(heading);

  if (!includeListenButton) {
    return { headingRow, heading, listenButton: null };
  }

  const listenButton = document.createElement("button");
  listenButton.type = "button";
  listenButton.className = "icon-button results-listen";
  if (!ttsAvailable) {
    listenButton.classList.add("is-hidden");
  }
  const listenLabel = ttsSpeaking ? STOP_LISTEN_LABEL : LISTEN_LABEL;
  listenButton.setAttribute("aria-label", listenLabel);
  listenButton.setAttribute("title", listenLabel);
  listenButton.innerHTML = `<img src="img/${
    ttsSpeaking ? "fas-stop.svg" : "fas-listen.svg"
  }" alt="" aria-hidden="true" />`;
  headingRow.appendChild(listenButton);

  return { headingRow, heading, listenButton };
}
