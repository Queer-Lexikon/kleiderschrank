export const createTtsController = ({ onStatusChange } = {}) => {
  let available = false;
  let speaking = false;
  let voice = null;
  let utterance = null;

  const notify = () => {
    if (onStatusChange) {
      onStatusChange({ available, speaking, voice });
    }
  };

  const getGermanVoices = (voices) =>
    voices.filter(
      (candidate) =>
        candidate.lang && candidate.lang.toLowerCase().startsWith("de"),
    );

  const updateAvailability = () => {
    if (!("speechSynthesis" in window)) {
      available = false;
      voice = null;
      notify();
      return;
    }

    const voices = window.speechSynthesis.getVoices();
    const germanVoices = getGermanVoices(voices);
    available = germanVoices.length > 0;
    voice = germanVoices[0] || null;
    notify();
  };

  const stop = () => {
    if (!("speechSynthesis" in window)) {
      return;
    }

    if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
      window.speechSynthesis.cancel();
    }

    speaking = false;
    utterance = null;
    notify();
  };

  const speak = (text) => {
    if (!available) {
      return;
    }

    const germanVoices = getGermanVoices(window.speechSynthesis.getVoices());
    if (germanVoices.length === 0) {
      return;
    }

    // For more diversity in the output, we want to randomly switch between all the available voices.
    const randomIndex = Math.floor(Math.random() * germanVoices.length);
    voice = germanVoices[randomIndex];
    const sanitized = text ? text.trim() : "";
    if (!sanitized) {
      return;
    }

    stop();
    const nextUtterance = new SpeechSynthesisUtterance(sanitized);
    nextUtterance.voice = voice;
    nextUtterance.lang = voice.lang || "de-DE";

    nextUtterance.onend = () => {
      speaking = false;
      notify();
    };

    nextUtterance.onerror = () => {
      speaking = false;
      notify();
    };

    speaking = true;
    utterance = nextUtterance;
    notify();
    window.speechSynthesis.speak(nextUtterance);
  };

  const toggle = (text) => {
    if (!available) {
      return;
    }

    if (speaking) {
      stop();
      return;
    }

    speak(text);
  };

  const init = () => {
    updateAvailability();
    if ("speechSynthesis" in window) {
      window.speechSynthesis.addEventListener("voiceschanged", () => {
        updateAvailability();
      });
    }
  };

  const getState = () => ({ available, speaking, voice, utterance });

  return {
    init,
    updateAvailability,
    stop,
    speak,
    toggle,
    getState,
  };
};
