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

import { getPronounFormLabel as getPronounFormLabelHelper } from "./pronounForms.js";

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
   * Normalize a token into a human-friendly pronoun form label.
   *
   * @param {string} token The raw token between brackets.
   * @returns {string} A label for the pronoun form.
   */
  static getPronounFormLabel(token) {
    return getPronounFormLabelHelper(token);
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
    if (lower === "nominativ" || lower === "dativ" || lower === "akkusativ") {
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
   *   firstName, lastName, lastNameSource (optional), and
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

    /** Pick a person at random, applying default fallbacks. */
    const pickPerson = () => {
      const fallback = { firstName: "", lastName: "", salutation: "" };
      if (!people || people.length === 0) {
        return fallback;
      }
      const person = PronounTool.randomChoice(people);
      return {
        firstName: person.firstName || "",
        lastName: person.lastName || "",
        lastNameSource: person.lastNameSource || "user",
        salutation: person.salutation || "",
        isAutoGenerated: Boolean(person.isAutoGenerated),
      };
    };

    /** Resolve name-related tokens and last-name metadata. */
    const resolveNameToken = (token, person) => {
      const resolvedLastName = person.lastName;
      const usesLastNameToken =
        token === "Nachname" ||
        token === "Vorname Nachname" ||
        token === "Vorname + Nachname" ||
        token === "Anrede" ||
        token === "Anrede/Vorname + Nachname";
      const resolveAddress = () => {
        if (person.salutation) {
          const surname = resolvedLastName || person.firstName;
          return surname
            ? `${person.salutation} ${surname}`
            : person.salutation;
        }
        return (
          person.firstName + (resolvedLastName ? ` ${resolvedLastName}` : "")
        );
      };

      let replacement = "";
      if (token === "Vorname") {
        replacement = person.firstName;
      } else if (token === "Nachname") {
        replacement = resolvedLastName;
      } else if (
        token === "Vorname Nachname" ||
        token === "Vorname + Nachname"
      ) {
        replacement =
          person.firstName + (resolvedLastName ? ` ${resolvedLastName}` : "");
      } else if (token === "Anrede" || token === "Anrede/Vorname + Nachname") {
        replacement = resolveAddress();
      } else {
        replacement = token;
      }

      return {
        replacement,
        resolvedLastName,
        usesLastNameToken,
      };
    };

    let result = "";
    let usedAutoLastName = false;

    // Walk the input text character-by-character to preserve non-token text.
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
            } else if (lower === "akkusativ") {
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
            const safeFormLabel = PronounTool.escapeHTML(
              PronounTool.getPronounFormLabel(trimmed),
            );

            // Wrap in span with the corresponding pronoun as metadata
            result += `<span data-pronoun="${safePronounLabel}" data-pronoun-form="${safeFormLabel}" role="button" tabindex="0" aria-haspopup="dialog" aria-controls="markerDialog" aria-expanded="false">${safeReplacement}</span>`;
          } else {
            // Name or combined token
            const {
              firstName,
              lastName,
              lastNameSource,
              salutation,
              isAutoGenerated,
            } = pickPerson();
            const {
              replacement: nameReplacement,
              resolvedLastName,
              usesLastNameToken,
            } = resolveNameToken(trimmed, {
              firstName,
              lastName,
              lastNameSource,
              salutation,
            });
            replacement = nameReplacement;

            replacement = PronounTool.adjustCase(trimmed, replacement);
            const safeReplacement = PronounTool.escapeHTML(replacement);

            if (
              usesLastNameToken &&
              resolvedLastName &&
              lastNameSource === "auto" &&
              replacement.includes(resolvedLastName)
            ) {
              usedAutoLastName = true;
            }

            const nameSource =
              isAutoGenerated ||
              (usesLastNameToken &&
                lastNameSource === "auto" &&
                resolvedLastName &&
                replacement.includes(resolvedLastName))
                ? "auto"
                : "user";
            const safeNameSource = PronounTool.escapeHTML(nameSource);
            result += `<span data-name="true" data-name-source="${safeNameSource}" role="button" tabindex="0" aria-haspopup="dialog" aria-controls="markerDialog" aria-expanded="false">${safeReplacement}</span>`;
          }

          i = end + 1;
          continue;
        }
      }

      // If not a token, append the character as is
      result += PronounTool.escapeHTML(ch);
      i += 1;
    }

    return { html: result, pronounSet: fixedSet, usedAutoLastName };
  }
}
