/**
 * Ensure the icon row is inserted into results controls.
 * @param {object} viewState
 */
function ensureRow(viewState) {
  if (viewState.mobileIconRow.parentElement || !viewState.resultsControls) {
    return;
  }
  if (
    viewState.randomModeContainer &&
    viewState.randomModeContainer.parentElement === viewState.resultsControls
  ) {
    viewState.resultsControls.insertBefore(
      viewState.mobileIconRow,
      viewState.randomModeContainer.nextSibling,
    );
  } else {
    viewState.resultsControls.appendChild(viewState.mobileIconRow);
  }
}

/**
 * Reflow action buttons based on viewport and mode visibility.
 * @param {object} viewState
 */
function update(viewState) {
  const listenButton = viewState.getListenButton
    ? viewState.getListenButton()
    : null;
  const randomModeHidden = Boolean(
    viewState.randomModeContainer?.classList.contains("is-hidden"),
  );
  if (viewState.rerunButton) {
    viewState.rerunButton.classList.toggle("is-hidden", randomModeHidden);
  }

  if (viewState.mobileQuery.matches) {
    ensureRow(viewState);
    [viewState.randomTextButton, viewState.rerunButton, listenButton]
      .filter(Boolean)
      .forEach((button) => {
        viewState.mobileIconRow.appendChild(button);
      });
    return;
  }

  if (viewState.randomTextButton) {
    viewState.getSelectRow?.()?.appendChild(viewState.randomTextButton);
  }
  if (viewState.rerunButton) {
    viewState.getRandomModeRow?.()?.appendChild(viewState.rerunButton);
  }
  if (listenButton) {
    viewState.getHeadingRow?.()?.appendChild(listenButton);
  }
}

/**
 * Attach media query listeners for automatic updates.
 * @param {object} viewState
 */
function attach(viewState) {
  viewState.mobileQuery.addEventListener(
    "change",
    update.bind(null, viewState),
  );
}

/**
 * Build a mobile-only icon row controller for result actions.
 * @param {object} params
 * @returns {{row: HTMLElement, attach: Function, update: Function}}
 */
export function createMobileIconRow({
  mobileQuery,
  resultsControls,
  randomModeContainer,
  randomTextButton,
  rerunButton,
  getListenButton,
  getHeadingRow,
  getSelectRow,
  getRandomModeRow,
}) {
  const mobileIconRow = document.createElement("div");
  mobileIconRow.className = "mobile-icon-row";

  const viewState = {
    mobileQuery,
    resultsControls,
    randomModeContainer,
    randomTextButton,
    rerunButton,
    getListenButton,
    getHeadingRow,
    getSelectRow,
    getRandomModeRow,
    mobileIconRow,
  };

  return {
    row: mobileIconRow,
    attach: attach.bind(null, viewState),
    update: update.bind(null, viewState),
  };
}
