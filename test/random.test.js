/**
 * Tests for chooseDifferent random selection helper.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { chooseDifferent } from "../src/domain/random.js";

test("Returns the only item when the list has one entry", () => {
  const items = [{ key: "a" }];
  const result = chooseDifferent(items, "a", (item) => item.key);
  assert.equal(result, items[0]);
});

test("Prefers a different key when available", () => {
  const items = [{ key: "a" }, { key: "b" }];
  const originalRandom = Math.random;
  let calls = 0;
  Math.random = () => {
    calls += 1;
    return calls === 1 ? 0 : 0.9;
  };

  const result = chooseDifferent(items, "a", (item) => item.key);
  assert.equal(result.key, "b");

  Math.random = originalRandom;
});

test("Can return the previous key after retries", () => {
  const items = [{ key: "a" }, { key: "b" }];
  const originalRandom = Math.random;
  Math.random = () => 0; // always pick first

  const result = chooseDifferent(items, "a", (item) => item.key);
  assert.equal(result.key, "a");

  Math.random = originalRandom;
});

test("Falls back to the first candidate when no previous key is set", () => {
  const items = [{ key: "a" }, { key: "b" }];
  const originalRandom = Math.random;
  Math.random = () => 0;

  const result = chooseDifferent(items, "", (item) => item.key);
  assert.equal(result.key, "a");

  Math.random = originalRandom;
});
