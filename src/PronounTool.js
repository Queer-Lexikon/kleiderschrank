/*
 * PronounTool.js
 *
 * The PronounTool orchestrates the substitution of tokens within a
 * sample text.  It accepts a list of PronounSet instances and uses
 * them to replace placeholders such as [Nominativ], [Vorname], etc.
 *
 * Two randomisation modes are supported:
 *   - "single": one pronoun set is chosen at random for the entire
 *     text.
 *   - "each": every pronoun placeholder is replaced by a random
 *     pronoun set from the provided selection.
 *
 * The tool wraps all replacements in a span element,
 * tagging pronoun replacements with the chosen set’s
 * bezeichnung in a data attribute. Capitalisation of the original
 * token is honoured by converting the first letter of the replacement.
 */

import PronounSet from "./PronounSet.js";

export default class PronounTool {
  /**
   * Escape HTML special characters to prevent injection.
   *
   * @param {string} value
   * @returns {string}
   */
  static escapeHTML(value) {
    if (value == null) return "";
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  /**
   * Create a new PronounTool.
   *
   * @param {PronounSet[]} pronounSets An array of available pronoun sets.
   */
  constructor(pronounSets) {
    this.pronounSets = pronounSets;
  }

  /**
   * Pick a random element from an array.
   *
   * @param {Array} arr The array to sample.
   * @returns {*} A random element.
   */
  static randomChoice(arr) {
    const idx = Math.floor(Math.random() * arr.length);
    return arr[idx];
  }

  /**
   * Adjust the first letter of a replacement to match the capitalisation
   * of the token. Only the first character is modified; the rest of
   * the string is left untouched.
   *
   * @param {string} token The raw token between the brackets.
   * @param {string} value The replacement string.
   * @returns {string} The value with adjusted capitalisation.
   */
  static adjustCase(token, value) {
    if (!value) return value;

    const first = token.trim().charAt(0);

    if (
      first &&
      first.toUpperCase() === first &&
      first.toLowerCase() !== first
    ) {
      // Token starts with an uppercase letter, so capitalise its replacement.
      return value.charAt(0).toUpperCase() + value.slice(1);
    }

    return value;
  }

  /**
   * Determine if a token should be treated as a pronoun form. Tokens
   * that refer to cases (e.g. Nominativ, Dativ, Poss. 1) or that
   * consist solely of letters without delimiters are considered
   * pronoun placeholders. Everything else (names, salutations,
   * combined tokens) is handled separately.
   *
   * @param {string} token The token inside brackets.
   * @returns {boolean} True if the token is a pronoun placeholder.
   */
  static isPronounToken(token) {
    const trimmed = token.trim();

    const lower = trimmed.toLowerCase();
    if (
      lower === "nominativ" ||
      lower === "dativ" ||
      lower === "akkusativ" ||
      lower === "akkuativ"
    ) {
      return true;
    }

    if (lower.startsWith("poss.")) {
      return true;
    }

    if (lower === "bezeichnung") {
      return true;
    }

    return false;
  }

  /**
   * Produce an HTML string with all placeholders replaced. Names can
   * include multiple entries separated by commas. When randomMode is
   * "each", every pronoun token is replaced using a randomly chosen
   * pronoun set, otherwise a single pronoun set is chosen for the
   * entire text.
   *
   * @param {string} text The input text with tokens.
   * @param {Object[]} people An array of person objects with the fields
   *   firstName, lastName (optional), fallbackLastName (optional), and
   *   salutation (optional).
   * @param {PronounSet[]} selectedSets The pronoun sets to choose from.
   * @param {string} randomMode Either "each" or "single".
   * @returns {Object} An object containing the HTML string and the
   *   pronoun set used when randomMode is "single" (undefined when
   *   randomMode is "each").
   */
  render(text, people, selectedSets, randomMode = "single") {
    // Choose a fixed pronoun set when randomMode is single
    let fixedSet = null;
    if (randomMode === "single") {
      fixedSet = PronounTool.randomChoice(selectedSets);
    }

    const pickPerson = () => {
      const fallback = { firstName: "", lastName: "", salutation: "" };
      if (!people || people.length === 0) {
        return fallback;
      }
      const person = PronounTool.randomChoice(people);
      return {
        firstName: person.firstName || "",
        lastName: person.lastName || "",
        fallbackLastName: person.fallbackLastName || "",
        salutation: person.salutation || "",
      };
    };

    let result = "";
    let usedFallbackLastName = false;

    for (let i = 0; i < text.length; ) {
      const ch = text.charAt(i);

      if (ch === "[") {
        const end = text.indexOf("]", i + 1);

        if (end !== -1) {
          const token = text.substring(i + 1, end);
          const trimmed = token.trim();
          let replacement = "";
          let isPronoun = PronounTool.isPronounToken(trimmed);

          if (isPronoun) {
            const pronounSet =
              randomMode === "each"
                ? PronounTool.randomChoice(selectedSets)
                : fixedSet;
            const { firstName } = pickPerson();

            const lower = trimmed.toLowerCase();
            if (lower === "bezeichnung") {
              replacement = pronounSet.bezeichnung;
            } else if (lower === "nominativ") {
              replacement = pronounSet.getForm("nominativ", firstName);
            } else if (lower === "dativ") {
              replacement = pronounSet.getForm("dativ", firstName);
            } else if (lower === "akkusativ" || lower === "akkuativ") {
              replacement = pronounSet.getForm("akkusativ", firstName);
            } else if (lower.startsWith("poss.")) {
              replacement = pronounSet.getForm(lower, firstName);
            } else {
              replacement = pronounSet.getForm("nominativ", firstName);
            }

            replacement = PronounTool.adjustCase(trimmed, replacement);
            const safeReplacement = PronounTool.escapeHTML(replacement);
            const safePronounLabel = PronounTool.escapeHTML(
              pronounSet.bezeichnung,
            );

            // Wrap in span with the corresponding pronoun as metadata
            result += `<span data-pronoun="${safePronounLabel}">${safeReplacement}</span>`;
          } else {
            // Name or combined token
            const { firstName, lastName, fallbackLastName, salutation } =
              pickPerson();
            const resolvedLastName = lastName || fallbackLastName;
            const hasFallbackLastName = !lastName && !!fallbackLastName;
            const usesLastNameToken =
              trimmed === "Nachname" ||
              trimmed === "Vorname Nachname" ||
              trimmed === "Vorname + Nachname" ||
              trimmed === "Anrede" ||
              trimmed === "Anrede/Vorname + Nachname";
            const resolveAddress = () => {
              if (salutation) {
                const surname = resolvedLastName || firstName;
                return surname ? `${salutation} ${surname}` : salutation;
              }
              return (
                firstName + (resolvedLastName ? ` ${resolvedLastName}` : "")
              );
            };
            if (trimmed === "Vorname") {
              replacement = firstName;
            } else if (trimmed === "Nachname") {
              replacement = resolvedLastName;
            } else if (
              trimmed === "Vorname Nachname" ||
              trimmed === "Vorname + Nachname"
            ) {
              replacement =
                firstName + (resolvedLastName ? " " + resolvedLastName : "");
            } else if (trimmed === "Anrede") {
              replacement = resolveAddress();
            } else if (
              trimmed === "Anrede/Vorname + Nachname" ||
              trimmed === "Anrede/Vorname + Nachname"
            ) {
              replacement = resolveAddress();
            } else {
              replacement = trimmed;
            }

            replacement = PronounTool.adjustCase(trimmed, replacement);
            const safeReplacement = PronounTool.escapeHTML(replacement);

            if (
              usesLastNameToken &&
              hasFallbackLastName &&
              resolvedLastName &&
              replacement.includes(resolvedLastName)
            ) {
              usedFallbackLastName = true;
            }

            result += `<span>${safeReplacement}</span>`;
          }

          i = end + 1;
          continue;
        }
      }

      // If not a token, append the character as is
      result += PronounTool.escapeHTML(ch);
      i += 1;
    }

    return { html: result, pronounSet: fixedSet, usedFallbackLastName };
  }
}
