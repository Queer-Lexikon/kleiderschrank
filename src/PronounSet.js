/*
 * PronounSet.js
 *
 * Defines a simple class representing a set of pronouns and their declensions.
 */

export default class PronounSet {
  /**
   * Construct a new pronoun set.
   *
   * @param {Object} options An object containing the declension forms.
   * @param {string} options.bezeichnung The human readable label.
   * @param {string|null} options.nominativ Form for the nominative case or
   *   null when using the person’s name (Keine Pronomen).
   * @param {string|null} options.dativ Form for the dative case.
   * @param {string|null} options.akkusativ Form for the accusative case.
   * @param {string|null} options.poss1 Possessive form 1.
   * @param {string|null} options.poss2 Possessive form 2.
   * @param {string|null} options.poss3 Possessive form 3.
   * @param {string|null} options.poss4 Possessive form 4.
   * @param {string|null} options.poss5 Possessive form 5.
   * @param {string|null} options.poss6 Possessive form 6.
   */
  constructor(options) {
    this.bezeichnung = options.bezeichnung;
    this.forms = {
      nominativ: options.nominativ,
      dativ: options.dativ,
      akkusativ: options.akkusativ,
      "poss. 1": options.poss1,
      "poss. 2": options.poss2,
      "poss. 3": options.poss3,
      "poss. 4": options.poss4,
      "poss. 5": options.poss5,
      "poss. 6": options.poss6,
    };
  }

  /**
   * Determine whether this set corresponds to the “Keine Pronomen” option.
   *
   * @returns {boolean} True when no personal pronouns are used.
   */
  get isNone() {
    return this.bezeichnung === "Keine Pronomen";
  }

  /**
   * Compute the possessive suffix for a name. When the name ends
   * with an s/S or x/X, only an apostrophe is appended. Otherwise an "s" is added.
   *
   * @param {string} name The base name.
   * @returns {string} The possessive form of the name.
   */
  static possessive(name) {
    if (!name) return "";

    const trimmed = String(name).trim();
    if (!trimmed) return "";

    const match = trimmed.match(/[\p{L}\p{M}]*[\p{L}]$/u);
    const last = match ? match[0].slice(-1) : trimmed.slice(-1);
    if (last === "s" || last === "S" || last === "x" || last === "X") {
      return trimmed + "'";
    }

    return trimmed + "s";
  }

  /**
   * Retrieve the appropriate form for a given token. When no pronouns
   * are used, the person’s name (firstName) is returned for the
   * nominative, dative and accusative cases; the possessive cases append
   * a genitive suffix to the name.
   *
   * @param {string} token The token, e.g. "Nominativ", "Dativ", "Akkusativ",
   *   or "Poss. 1".
   * @param {string} personName The person’s name used for the no pronoun
   *   variant.
   * @returns {string} The selected pronoun or name form.
   */
  getForm(token, personName) {
    // Normalise token key
    const key = token.toLowerCase();

    if (this.isNone) {
      // Without pronouns: nominativ/dativ/akkusativ all use the name.
      if (
        key === "nominativ" ||
        key === "dativ" ||
        key === "akkusativ" ||
        key === "akkuativ"
      ) {
        return personName;
      }

      // Possessive forms: append the possessive suffix.
      if (key.startsWith("poss.")) {
        return PronounSet.possessive(personName);
      }

      // Fallback to name if the token is unknown.
      return personName;
    }

    // Use stored form; if not found return empty string.
    const value = this.forms[key];
    if (value == null) {
      return "";
    }

    return value;
  }
}
