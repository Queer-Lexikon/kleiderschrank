export const DECLENSION_FIELDS = [
  { label: "Nominativ", key: "nominativ" },
  { label: "Dativ", key: "dativ" },
  { label: "Akkusativ", key: "akkusativ" },
  { label: "Possessiv 1", key: "poss. 1" },
  { label: "Possessiv 2", key: "poss. 2" },
  { label: "Possessiv 3", key: "poss. 3" },
  { label: "Possessiv 4", key: "poss. 4" },
  { label: "Possessiv 5", key: "poss. 5" },
  { label: "Possessiv 6", key: "poss. 6" },
];

/**
 * Map a pronoun token to a human-friendly form label.
 * @param {string|null} token
 * @returns {string}
 */
export function getPronounFormLabel(token) {
  if (!token) {
    return "";
  }
  const trimmed = token.trim();
  const lower = trimmed.toLowerCase();

  if (lower === "bezeichnung") {
    return "Bezeichnung";
  }
  if (lower === "nominativ") {
    return "Nominativ";
  }
  if (lower === "dativ") {
    return "Dativ";
  }
  if (lower === "akkusativ") {
    return "Akkusativ";
  }
  if (lower.startsWith("poss.")) {
    const match = trimmed.match(/poss\.\s*(\d+)/i);
    if (match) {
      return `Poss. ${match[1]}`;
    }
    return "Possessiv";
  }

  return trimmed;
}
