import PronounTool from "../PronounTool.js";
import SampleTexts from "../../data/SampleTexts.js";
import {
  FALLBACK_LAST_NAME_NOTICE,
  RESULTS_DEFAULT_HEADING,
  LISTEN_LABEL,
  STOP_LISTEN_LABEL,
} from "./constants.js";

// The tool only needs the pronoun sets passed into render().
const tool = new PronounTool([]);

// Render output HTML and return the effective single-mode selection.
export const renderResults = ({
  resultsContainer,
  names,
  pronounSets,
  salutation,
  textKey,
  randomMode,
  ttsAvailable,
  ttsSpeaking,
}) => {
  const selectedEntry = SampleTexts[textKey];
  const text = selectedEntry && selectedEntry.text ? selectedEntry.text : "";
  const effectiveNames =
    randomMode === "single"
      ? [names[Math.floor(Math.random() * names.length)]]
      : names;
  const peopleWithSalutation = effectiveNames.map((person) => ({
    firstName: person.firstName,
    lastName: person.lastName,
    fallbackLastName: person.fallbackLastName || "",
    salutation,
  }));
  const result = tool.render(
    text,
    peopleWithSalutation,
    pronounSets,
    randomMode,
  );

  resultsContainer.innerHTML = "";
  const heading = document.createElement("h2");
  heading.textContent =
    selectedEntry && selectedEntry.title
      ? selectedEntry.title
      : RESULTS_DEFAULT_HEADING;
  if (randomMode === "single" && result.pronounSet) {
    heading.textContent += ` – ${result.pronounSet.bezeichnung}`;
  }

  const paragraph = document.createElement("p");
  paragraph.innerHTML = result.html;

  const headingRow = document.createElement("div");
  headingRow.className = "results-heading";
  headingRow.appendChild(heading);

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

  resultsContainer.appendChild(headingRow);
  resultsContainer.appendChild(paragraph);

  // Add a user-facing notice if a random last name has been used so people aren't terrified when they accidentally see their real last name without providing it.
  if (result.usedFallbackLastName) {
    const disclaimer = document.createElement("p");
    disclaimer.className = "results-disclaimer";
    const icon = document.createElement("img");
    icon.src = "img/fas-info.svg";
    icon.alt = "";
    icon.setAttribute("aria-hidden", "true");
    icon.className = "results-disclaimer__icon";
    disclaimer.appendChild(icon);

    const textNode = document.createElement("div");
    textNode.className = "results-disclaimer__text";
    textNode.textContent = FALLBACK_LAST_NAME_NOTICE;
    disclaimer.appendChild(textNode);
    resultsContainer.appendChild(disclaimer);
  }

  return {
    pronounSet: result.pronounSet || null,
    selectedName: effectiveNames[0] || null,
    listenButton,
  };
};
