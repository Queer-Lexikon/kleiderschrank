// Tiny DOM helpers for consistent query usage.
/**
 * Query a single element from the DOM.
 * @param {string} selector
 * @param {ParentNode} root
 * @returns {Element|null}
 */
export const $ = (selector, root = document) => root.querySelector(selector);

/**
 * Query multiple elements from the DOM as an array.
 * @param {string} selector
 * @param {ParentNode} root
 * @returns {Element[]}
 */
export const $$ = (selector, root = document) =>
  Array.from(root.querySelectorAll(selector));
