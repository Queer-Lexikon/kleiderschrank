/**
 * Return a no-op dialog API when dialog elements are missing.
 * @returns {{open: Function, close: Function}}
 */
function createFallbackDialogApi() {
  return {
    open: () => {},
    close: () => {},
  };
}

/**
 * Replace dialog body text content.
 * @param {object} viewState
 * @param {string} text
 */
function renderMarkerDialogText(viewState, text) {
  viewState.dialogBody.textContent = text;
}

/**
 * Position the dialog relative to the target element.
 * @param {object} viewState
 * @param {HTMLElement|null} target
 */
function positionDialog(viewState, target) {
  if (!target) {
    return;
  }
  const targetRect = target.getBoundingClientRect();
  const dialogRect = viewState.dialog.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  const padding = 12;
  const gap = 0;
  const arrowSize = 6;

  const spaceAbove = targetRect.top;
  const spaceBelow = viewportHeight - targetRect.bottom;
  const placeBelow =
    spaceBelow >= dialogRect.height + gap + arrowSize ||
    spaceBelow >= spaceAbove;
  const placement = placeBelow ? "bottom" : "top";

  let top = placeBelow
    ? targetRect.bottom + gap + arrowSize
    : targetRect.top - dialogRect.height - gap - arrowSize;
  let left = targetRect.left + targetRect.width / 2 - dialogRect.width / 2;

  left = Math.max(
    padding,
    Math.min(left, viewportWidth - dialogRect.width - padding),
  );
  top = Math.max(
    padding,
    Math.min(top, viewportHeight - dialogRect.height - padding),
  );

  viewState.dialog.style.left = `${left}px`;
  viewState.dialog.style.top = `${top}px`;
  viewState.dialog.dataset.placement = placement;

  const arrowLeft = targetRect.left + targetRect.width / 2 - left;
  const clampedArrowLeft = Math.max(
    16,
    Math.min(dialogRect.width - 16, arrowLeft),
  );
  viewState.dialog.style.setProperty(
    "--marker-arrow-left",
    `${clampedArrowLeft}px`,
  );
}

/**
 * Open the dialog with new content and focus handling.
 * @param {object} viewState
 * @param {{title: string, text: string, trigger: HTMLElement}} params
 */
function openDialog(viewState, { title, text, trigger }) {
  viewState.dialogTitle.textContent = title;
  renderMarkerDialogText(viewState, text);
  viewState.lastFocus = trigger || document.activeElement;
  viewState.currentTarget = trigger || null;
  viewState.isOpen = true;
  if (viewState.currentTarget) {
    viewState.currentTarget.setAttribute("aria-expanded", "true");
  }
  if (typeof viewState.dialog.showModal === "function") {
    viewState.dialog.showModal();
  } else if (typeof viewState.dialog.show === "function") {
    viewState.dialog.show();
  } else {
    viewState.dialog.setAttribute("open", "true");
  }
  positionDialog(viewState, viewState.currentTarget);
  viewState.dialogBody.focus();
}

/**
 * Close the dialog and restore trigger state.
 * @param {object} viewState
 */
function closeDialog(viewState) {
  if (!viewState.isOpen) {
    return;
  }
  if (viewState.dialog.open) {
    viewState.dialog.close();
  } else {
    viewState.dialog.removeAttribute("open");
  }
  viewState.isOpen = false;
  if (viewState.currentTarget) {
    viewState.currentTarget.setAttribute("aria-expanded", "false");
  }
  viewState.currentTarget = null;
}

/**
 * Restore focus when the dialog closes.
 * @param {object} viewState
 */
function handleDialogClose(viewState) {
  if (viewState.lastFocus && document.contains(viewState.lastFocus)) {
    viewState.lastFocus.focus();
  }
  viewState.lastFocus = null;
}

/**
 * Close the dialog on Escape key.
 * @param {object} viewState
 * @param {KeyboardEvent} event
 */
function handleDocumentKeydown(viewState, event) {
  if (event.key === "Escape") {
    closeDialog(viewState);
  }
}

/**
 * Close the dialog when clicking outside.
 * @param {object} viewState
 * @param {PointerEvent} event
 */
function handleOutsidePointer(viewState, event) {
  if (!viewState.isOpen) {
    return;
  }
  if (viewState.dialog.contains(event.target)) {
    return;
  }
  closeDialog(viewState);
}

/**
 * Reposition the dialog on viewport changes.
 * @param {object} viewState
 */
function handleViewportChange(viewState) {
  if (!viewState.isOpen || !viewState.currentTarget) {
    return;
  }
  positionDialog(viewState, viewState.currentTarget);
}

/**
 * Close the dialog via the explicit close button.
 * @param {object} viewState
 * @param {MouseEvent} event
 */
function handleDialogClick(viewState, event) {
  const closeTarget = event.target.closest("[data-dialog-close]");
  if (closeTarget) {
    closeDialog(viewState);
  }
}

/**
 * Handle marker clicks within the results output.
 * @param {object} viewState
 * @param {MouseEvent} event
 */
function handleResultsClick(viewState, event) {
  const target = event.target.closest("[data-pronoun], [data-name]");
  if (!target) {
    return;
  }
  if (target.hasAttribute("data-pronoun")) {
    const pronounLabel = target.getAttribute("data-pronoun") || "–";
    const formLabel = target.getAttribute("data-pronoun-form") || "–";
    openDialog(viewState, {
      title: "Pronomen-Info",
      text: `${pronounLabel} — ${formLabel}`,
      trigger: target,
    });
    return;
  }
  const defaultSource = viewState.resultsOutput.dataset.nameSourceDefault || "";
  const source =
    defaultSource || target.getAttribute("data-name-source") || "user";
  const sourceLabel =
    source === "auto" ? "Zufällig ergänzt" : "Von dir eingegeben";
  openDialog(viewState, {
    title: "Namens-Info",
    text: `Quelle — ${sourceLabel}`,
    trigger: target,
  });
}

/**
 * Handle keyboard activation for marker items.
 * @param {object} viewState
 * @param {KeyboardEvent} event
 */
function handleResultsKeydown(viewState, event) {
  if (event.key !== "Enter" && event.key !== " ") {
    return;
  }
  const target = event.target.closest("[data-pronoun], [data-name]");
  if (!target) {
    return;
  }
  event.preventDefault();
  target.click();
}

/**
 * Initialize the marker info dialog behavior and handlers.
 * @param {object} params
 * @returns {{open: Function, close: Function}}
 */
export function initMarkerDialog({
  dialog,
  dialogBody,
  dialogTitle,
  resultsOutput,
}) {
  if (!dialog || !dialogBody || !dialogTitle || !resultsOutput) {
    return createFallbackDialogApi();
  }

  const viewState = {
    dialog,
    dialogBody,
    dialogTitle,
    resultsOutput,
    lastFocus: null,
    currentTarget: null,
    isOpen: false,
  };

  dialog.addEventListener("close", handleDialogClose.bind(null, viewState));
  dialog.addEventListener("click", handleDialogClick.bind(null, viewState));

  document.addEventListener(
    "keydown",
    handleDocumentKeydown.bind(null, viewState),
  );
  document.addEventListener(
    "pointerdown",
    handleOutsidePointer.bind(null, viewState),
  );
  window.addEventListener("resize", handleViewportChange.bind(null, viewState));
  window.addEventListener(
    "scroll",
    handleViewportChange.bind(null, viewState),
    true,
  );

  resultsOutput.addEventListener(
    "click",
    handleResultsClick.bind(null, viewState),
  );
  resultsOutput.addEventListener(
    "keydown",
    handleResultsKeydown.bind(null, viewState),
  );

  return {
    open: openDialog.bind(null, viewState),
    close: closeDialog.bind(null, viewState),
  };
}
