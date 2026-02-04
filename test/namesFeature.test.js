/**
 * Tests for name list UI helpers.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { createDom, cleanupDom } from "./helpers/dom.js";
import {
  createNameListState,
  getNameInputs,
  getNameRows,
  countFilledNameInputs,
  hasAnyNameValues,
  syncNameLabelTarget,
  updateNameButtons,
  removeNameRow,
  createNameRow,
  addNameRow,
  ensureNameRows,
} from "../src/features/names.js";

function buildContainer(dom) {
  const document = dom.window.document;
  const container = document.createElement("div");
  return container;
}

test("Creates name list state with a container and max count", () => {
  const dom = createDom();
  const container = buildContainer(dom);

  const stateDefault = createNameListState({ container });
  assert.equal(stateDefault.container, container);
  assert.ok(stateDefault.maxNames > 0);

  const stateCustom = createNameListState({ container, maxNames: 5 });
  assert.equal(stateCustom.maxNames, 5);

  cleanupDom(dom);
});

test("Finds name inputs and rows", () => {
  const dom = createDom();
  const document = dom.window.document;
  const container = buildContainer(dom);

  const row = document.createElement("div");
  row.className = "name-row";
  const input = document.createElement("input");
  input.className = "name-input";
  row.appendChild(input);
  container.appendChild(row);

  const nameList = { container };

  assert.equal(getNameRows(nameList).length, 1);
  assert.equal(getNameInputs(nameList).length, 1);

  cleanupDom(dom);
});

test("Counts filled name inputs after trimming", () => {
  const dom = createDom();
  const document = dom.window.document;
  const container = buildContainer(dom);

  const row = document.createElement("div");
  row.className = "name-row";
  const input = document.createElement("input");
  input.className = "name-input";
  input.value = "  ";
  row.appendChild(input);
  container.appendChild(row);

  const nameList = { container };
  assert.equal(countFilledNameInputs(nameList), 0);
  assert.equal(hasAnyNameValues(nameList), false);

  input.value = "Alex";
  assert.equal(countFilledNameInputs(nameList), 1);
  assert.equal(hasAnyNameValues(nameList), true);

  cleanupDom(dom);
});

test("Keeps name input labels and ids in sync", () => {
  const dom = createDom();
  const document = dom.window.document;
  const container = buildContainer(dom);

  const first = document.createElement("input");
  first.className = "name-input";
  const second = document.createElement("input");
  second.className = "name-input";
  second.id = "names";
  container.append(first, second);

  syncNameLabelTarget({ container });

  assert.equal(first.id, "names");
  assert.equal(first.hasAttribute("aria-label"), false);
  assert.equal(second.id, "");
  assert.equal(second.getAttribute("aria-label"), "Weiterer Name");

  cleanupDom(dom);
});

test("Toggles remove button visibility", () => {
  const dom = createDom();
  const document = dom.window.document;
  const container = buildContainer(dom);

  const row = document.createElement("div");
  row.className = "name-row";
  const input = document.createElement("input");
  input.className = "name-input";
  const removeButton = document.createElement("button");
  removeButton.className = "remove-name";
  row.append(input, removeButton);
  container.appendChild(row);

  updateNameButtons({ container });
  assert.equal(removeButton.classList.contains("is-hidden"), true);

  const row2 = document.createElement("div");
  row2.className = "name-row";
  const input2 = document.createElement("input");
  input2.className = "name-input";
  const remove2 = document.createElement("button");
  remove2.className = "remove-name";
  row2.append(input2, remove2);
  container.appendChild(row2);

  updateNameButtons({ container });
  assert.equal(removeButton.classList.contains("is-hidden"), false);
  assert.equal(remove2.classList.contains("is-hidden"), false);
  assert.equal(input2.getAttribute("aria-label"), "Weiterer Name");

  cleanupDom(dom);
});

test("Removes a name row and focuses the next input", () => {
  const dom = createDom();
  const document = dom.window.document;
  const container = buildContainer(dom);

  const row1 = document.createElement("div");
  row1.className = "name-row";
  const input1 = document.createElement("input");
  input1.className = "name-input";
  row1.appendChild(input1);

  const row2 = document.createElement("div");
  row2.className = "name-row";
  const input2 = document.createElement("input");
  input2.className = "name-input";
  row2.appendChild(input2);

  container.append(row1, row2);

  let changed = 0;
  let focused = false;
  input2.focus = () => {
    focused = true;
  };
  removeNameRow({ container }, row1, input1, () => {
    changed += 1;
  });

  assert.equal(changed, 1);
  assert.equal(container.contains(row1), false);
  assert.equal(focused, true);

  cleanupDom(dom);
});

test("Removes the final name row", () => {
  const dom = createDom();
  const container = buildContainer(dom);

  const row = document.createElement("div");
  row.className = "name-row";
  const input = document.createElement("input");
  input.className = "name-input";
  row.appendChild(input);
  container.appendChild(row);

  removeNameRow({ container }, row, input, null);
  assert.equal(container.querySelectorAll(".name-row").length, 0);

  cleanupDom(dom);
});

test("Builds a name row and wires events", () => {
  const dom = createDom();
  const container = buildContainer(dom);
  const nameList = { container, maxNames: 3 };
  let changed = 0;

  const row = createNameRow(nameList, "Sam", () => {
    changed += 1;
  });
  container.appendChild(row);

  const input = row.querySelector(".name-input");
  const removeButton = row.querySelector(".remove-name");
  assert.ok(input);
  assert.equal(input.value, "Sam");
  assert.ok(removeButton);

  input.value = "Sammy";
  input.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
  assert.equal(changed, 1);

  cleanupDom(dom);
});

test("Enter adds a row; backspace removes an empty row", () => {
  const dom = createDom();
  const container = buildContainer(dom);
  const nameList = { container, maxNames: 3 };

  const row = createNameRow(nameList, "", null);
  container.appendChild(row);
  updateNameButtons(nameList);

  const input = row.querySelector(".name-input");
  input.dispatchEvent(
    new dom.window.KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
  );

  assert.equal(container.querySelectorAll(".name-row").length, 2);

  const rows = container.querySelectorAll(".name-row");
  const secondInput = rows[1].querySelector(".name-input");
  secondInput.value = "";

  secondInput.dispatchEvent(
    new dom.window.KeyboardEvent("keydown", { key: "Backspace", bubbles: true }),
  );

  assert.equal(container.querySelectorAll(".name-row").length, 1);

  cleanupDom(dom);
});

test("Backspace does nothing when input has a value or only one row", () => {
  const dom = createDom();
  const container = buildContainer(dom);
  const nameList = { container, maxNames: 3 };

  const row = createNameRow(nameList, "Alex", null);
  container.appendChild(row);
  const input = row.querySelector(".name-input");

  input.dispatchEvent(
    new dom.window.KeyboardEvent("keydown", { key: "Backspace", bubbles: true }),
  );
  assert.equal(container.querySelectorAll(".name-row").length, 1);

  input.dispatchEvent(
    new dom.window.KeyboardEvent("keydown", { key: "Tab", bubbles: true }),
  );
  assert.equal(container.querySelectorAll(".name-row").length, 1);

  input.value = "";
  input.dispatchEvent(
    new dom.window.KeyboardEvent("keydown", { key: "Backspace", bubbles: true }),
  );
  assert.equal(container.querySelectorAll(".name-row").length, 1);

  cleanupDom(dom);
});

test("Remove button deletes the row", () => {
  const dom = createDom();
  const container = buildContainer(dom);
  const nameList = { container, maxNames: 3 };

  const row = createNameRow(nameList, "Alex", null);
  container.appendChild(row);
  const removeButton = row.querySelector(".remove-name");
  removeButton.click();

  assert.equal(container.querySelectorAll(".name-row").length, 0);

  cleanupDom(dom);
});

test("Adds a row up to max and focuses the new input", () => {
  const dom = createDom();
  const container = buildContainer(dom);
  const nameList = { container, maxNames: 1 };

  let focused = false;
  const originalFocus = dom.window.HTMLElement.prototype.focus;
  dom.window.HTMLElement.prototype.focus = () => {
    focused = true;
  };

  const row = addNameRow(nameList, "", null);
  assert.ok(row);
  assert.equal(focused, true);

  const second = addNameRow(nameList, "", null);
  assert.equal(second, null);

  dom.window.HTMLElement.prototype.focus = originalFocus;

  cleanupDom(dom);
});

test("Preserves existing name rows", () => {
  const dom = createDom();
  const container = buildContainer(dom);
  const nameList = { container, maxNames: 3 };

  addNameRow(nameList, "Alex", null);
  ensureNameRows(nameList, null);

  assert.equal(container.querySelectorAll(".name-row").length, 1);

  cleanupDom(dom);
});

test("Creates a row when none exist", () => {
  const dom = createDom();
  const container = buildContainer(dom);
  const nameList = { container, maxNames: 3 };

  ensureNameRows(nameList, null);
  assert.equal(container.querySelectorAll(".name-row").length, 1);

  cleanupDom(dom);
});

test("Rebuilds rows when inputs exist without rows", () => {
  const dom = createDom();
  const document = dom.window.document;
  const container = buildContainer(dom);
  const nameList = { container, maxNames: 3 };

  const input = document.createElement("input");
  input.className = "name-input";
  input.value = "Pat";
  container.appendChild(input);

  ensureNameRows(nameList, null);

  const rows = container.querySelectorAll(".name-row");
  assert.equal(rows.length, 1);
  const rowInput = rows[0].querySelector(".name-input");
  assert.equal(rowInput.value, "Pat");

  cleanupDom(dom);
});
