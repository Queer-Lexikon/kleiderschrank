import lastNames from "../../data/lastNames.js";
import firstNames from "../../data/firstNames.js";

// Normalize name objects to compare across reruns.
export const getNameKey = (name) =>
  `${name.firstName || ""}|${name.lastName || ""}|${
    name.fallbackLastName || ""
  }`;

// Split the name input into structured name objects.
export const parseNames = (inputs) => {
  const rawNames = inputs
    .flatMap((input) => input.value.split(","))
    .map((value) => value.trim())
    .filter((value) => value);

  return rawNames.map((name) => {
    const parts = name.split(/\s+/).filter((part) => part);

    if (parts.length > 1) {
      const lastName = parts.pop();
      return { firstName: parts.join(" "), lastName };
    }

    const randomIdx = Math.floor(Math.random() * lastNames.length);
    const fallbackLastName = lastNames[randomIdx] || "";

    return { firstName: parts[0], lastName: "", fallbackLastName };
  });
};

// Build a random preview name, avoiding the last one when possible.
export const buildRandomPreviewName = (excludeKey) => {
  let attempts = 0;
  let next = null;
  do {
    const firstName =
      firstNames[Math.floor(Math.random() * firstNames.length)] || "Alex";
    const fallbackLastName =
      lastNames[Math.floor(Math.random() * lastNames.length)] || "";
    next = { firstName, lastName: "", fallbackLastName };
    attempts += 1;
  } while (excludeKey && getNameKey(next) === excludeKey && attempts < 20);

  return next;
};
