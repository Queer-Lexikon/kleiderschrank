/**
 * Parse URL query params into app state values.
 * @param {string} search
 * @param {{maxNames?: number}} options
 * @returns {object}
 */
export function parseUrlState(search, { maxNames } = {}) {
  const params = new URLSearchParams(search);

  const namesValue = params.get("names");
  const names =
    namesValue === null
      ? null
      : namesValue
          .split(",")
          .map((value) => value.trim())
          .filter((value) => value)
          .slice(0, maxNames || undefined);

  const salutation = params.get("salutation");
  const textKey = params.get("text");
  const pronounsValue = params.get("pronouns");
  const pronounIndexes =
    pronounsValue === null
      ? null
      : pronounsValue
          .split(",")
          .map((value) => value.trim())
          .filter((value) => value);
  const randomMode = params.get("random");
  const markers = params.get("markers");
  const declensionTabId = params.get("declensionTab");

  return {
    names,
    salutation,
    textKey,
    pronounIndexes,
    randomMode,
    markers,
    declensionTabId,
  };
}

/**
 * Build a shareable URL containing the current app state.
 * @param {object} params
 * @returns {string}
 */
export function buildShareUrl({
  baseUrl,
  names,
  salutation,
  textKey,
  pronouns,
  randomMode,
  markers,
  declensionTabId,
}) {
  const params = new URLSearchParams();

  const namesValue = (names || []).map((name) => name.trim()).filter(Boolean);
  if (namesValue.length > 0) {
    params.set("names", namesValue.join(", "));
  }

  if (salutation) {
    params.set("salutation", salutation);
  }

  if (textKey) {
    params.set("text", textKey);
  }

  const pronounValues = (pronouns || [])
    .map((value) => value.trim())
    .filter(Boolean);
  if (pronounValues.length > 0) {
    params.set("pronouns", pronounValues.join(","));
  }

  if (randomMode) {
    params.set("random", randomMode);
  }

  if (markers) {
    params.set("markers", markers);
  }

  if (declensionTabId) {
    params.set("declensionTab", declensionTabId);
  }

  const url = new URL(baseUrl || window.location.href);
  url.search = params.toString();
  url.hash = "resultsOutput";
  return url.toString();
}
