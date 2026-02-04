import { getRandomEligibleOptions } from "../features/texts.js";
import { generateFlow } from "./generateFlow.js";

/**
 * Choose a random eligible text option and re-render.
 * @param {object} ctx
 */
export function randomTextFlow(ctx) {
  const randomOptions = getRandomEligibleOptions(ctx.elements.textSelector);
  const optionCount = randomOptions.length;
  if (optionCount === 0) {
    return;
  }
  if (optionCount === 1) {
    ctx.elements.textSelector.value = randomOptions[0].value;
    return;
  }
  const currentValue = ctx.elements.textSelector.value;
  let randomOption = randomOptions[Math.floor(Math.random() * optionCount)];
  if (randomOptions.some((option) => option.value === currentValue)) {
    while (randomOption.value === currentValue) {
      randomOption = randomOptions[Math.floor(Math.random() * optionCount)];
    }
  }
  ctx.elements.textSelector.value = randomOption.value;
  generateFlow(ctx);
}
