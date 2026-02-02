export const createMobileIconRow = ({
  mobileQuery,
  resultsControls,
  randomModeContainer,
  randomTextButton,
  rerunButton,
  getListenButton,
  getHeadingRow,
  getSelectRow,
  getRandomModeRow,
}) => {
  const mobileIconRow = document.createElement("div");
  mobileIconRow.className = "mobile-icon-row";

  const ensureRow = () => {
    if (mobileIconRow.parentElement || !resultsControls) {
      return;
    }
    if (
      randomModeContainer &&
      randomModeContainer.parentElement === resultsControls
    ) {
      resultsControls.insertBefore(
        mobileIconRow,
        randomModeContainer.nextSibling,
      );
    } else {
      resultsControls.appendChild(mobileIconRow);
    }
  };

  const update = () => {
    const listenButton = getListenButton ? getListenButton() : null;
    const randomModeHidden = randomModeContainer
      ? randomModeContainer.classList.contains("is-hidden")
      : false;
    if (rerunButton) {
      rerunButton.classList.toggle("is-hidden", randomModeHidden);
    }

    if (mobileQuery.matches) {
      ensureRow();
      [randomTextButton, rerunButton, listenButton].forEach((button) => {
        if (button) {
          mobileIconRow.appendChild(button);
        }
      });
      return;
    }

    if (randomTextButton) {
      const selectRow = getSelectRow ? getSelectRow() : null;
      if (selectRow) {
        selectRow.appendChild(randomTextButton);
      }
    }
    if (rerunButton) {
      const randomModeRow = getRandomModeRow ? getRandomModeRow() : null;
      if (randomModeRow) {
        randomModeRow.appendChild(rerunButton);
      }
    }
    if (listenButton) {
      const headingRow = getHeadingRow ? getHeadingRow() : null;
      if (headingRow) {
        headingRow.appendChild(listenButton);
      }
    }
  };

  const attach = () => {
    mobileQuery.addEventListener("change", update);
  };

  return {
    row: mobileIconRow,
    attach,
    update,
  };
};
