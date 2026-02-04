/**
 * Tests for URL query parsing and share URL generation.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { parseUrlState, buildShareUrl } from "../src/domain/queryState.js";
import { createDom, cleanupDom } from "./helpers/dom.js";

const sampleUrl =
  "http://localhost/?names=Alex%20Smith,%20Sam&salutation=du&text=sample&pronouns=1,2&random=single&markers=on&declensionTab=declension-tab-table";

test("Parses URL state from query parameters", () => {
  const parsed = parseUrlState(new URL(sampleUrl).search, { maxNames: 3 });
  assert.deepEqual(parsed.names, ["Alex Smith", "Sam"]);
  assert.equal(parsed.salutation, "du");
  assert.equal(parsed.textKey, "sample");
  assert.deepEqual(parsed.pronounIndexes, ["1", "2"]);
  assert.equal(parsed.randomMode, "single");
  assert.equal(parsed.markers, "on");
  assert.equal(parsed.declensionTabId, "declension-tab-table");

  const emptyParsed = parseUrlState("");
  assert.equal(emptyParsed.names, null);
  assert.equal(emptyParsed.pronounIndexes, null);
  assert.equal(emptyParsed.randomMode, null);
});

test("Builds share URLs with encoded parameters", () => {
  const url = buildShareUrl({
    baseUrl: "http://localhost/",
    names: ["Alex Smith", "Sam"],
    salutation: "du",
    textKey: "sample",
    pronouns: ["1", "2"],
    randomMode: "each",
    markers: "off",
    declensionTabId: "declension-tab-table",
  });
  const parsed = new URL(url);
  assert.equal(parsed.pathname, "/");
  assert.equal(parsed.searchParams.get("names"), "Alex Smith, Sam");
  assert.equal(parsed.searchParams.get("salutation"), "du");
  assert.equal(parsed.searchParams.get("text"), "sample");
  assert.equal(parsed.searchParams.get("pronouns"), "1,2");
  assert.equal(parsed.searchParams.get("random"), "each");
  assert.equal(parsed.searchParams.get("markers"), "off");
  assert.equal(parsed.searchParams.get("declensionTab"), "declension-tab-table");
  assert.equal(parsed.hash, "#resultsOutput");
});

test("Omits empty params and uses window location when sharing", () => {
  const dom = createDom("<div></div>");
  const url = buildShareUrl({
    names: ["  ", ""],
    pronouns: ["", "  "],
  });
  const parsed = new URL(url);
  assert.equal(parsed.search, "");
  assert.equal(parsed.hash, "#resultsOutput");
  cleanupDom(dom);
});

test("Parses names when maxNames is disabled", () => {
  const parsed = parseUrlState("?names=Alex,Sam", { maxNames: 0 });
  assert.deepEqual(parsed.names, ["Alex", "Sam"]);
});

test("Parses empty pronoun selection", () => {
  const parsed = parseUrlState("?pronouns=");
  assert.deepEqual(parsed.pronounIndexes, []);
});

test("Handles missing name and pronoun lists when sharing", () => {
  const dom = createDom("<div></div>");
  const url = buildShareUrl({
    baseUrl: "http://localhost/",
  });
  const parsed = new URL(url);
  assert.equal(parsed.search, "");
  cleanupDom(dom);
});
