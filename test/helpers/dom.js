import { JSDOM } from "jsdom";

/**
 * Create a JSDOM instance and expose common globals for DOM tests.
 * @param {string} html
 * @returns {JSDOM}
 */
export const createDom = (html = "<!doctype html><html><body></body></html>") => {
  const dom = new JSDOM(html, { url: "http://localhost/" });
  global.window = dom.window;
  global.document = dom.window.document;
  global.HTMLElement = dom.window.HTMLElement;
  global.Node = dom.window.Node;
  global.CustomEvent = dom.window.CustomEvent;
  global.Event = dom.window.Event;
  global.DOMParser = dom.window.DOMParser;
  return dom;
};

/**
 * Cleanup globals and close the JSDOM instance.
 * @param {JSDOM} dom
 */
export const cleanupDom = (dom) => {
  if (dom) {
    dom.window.close();
  }
  delete global.window;
  delete global.document;
  delete global.HTMLElement;
  delete global.Node;
  delete global.CustomEvent;
  delete global.Event;
  delete global.DOMParser;
};
