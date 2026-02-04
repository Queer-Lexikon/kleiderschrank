/**
 * Create a text-to-speech controller with state callbacks.
 * @param {{onStatusChange?: Function}} params
 * @returns {object}
 */
export function createTtsController({ onStatusChange } = {}) {
  let available = false;
  let speaking = false;
  let voice = null;
  let utterance = null;

  /** Notify listeners of the latest TTS status. */
  function notify() {
    if (onStatusChange) {
      onStatusChange({ available, speaking, voice });
    }
  }

  /**
   * Filter voices to those matching German locales.
   * @param {SpeechSynthesisVoice[]} voices
   * @returns {SpeechSynthesisVoice[]}
   */
  function getGermanVoices(voices) {
    return voices.filter(
      (candidate) =>
        candidate.lang && candidate.lang.toLowerCase().startsWith("de"),
    );
  }

  /** Refresh availability and current voice selection. */
  function updateAvailability() {
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
  }

  /** Stop any ongoing speech and reset state. */
  function stop() {
    if (!("speechSynthesis" in window)) {
      return;
    }

    if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
      window.speechSynthesis.cancel();
    }

    speaking = false;
    utterance = null;
    notify();
  }

  /**
   * Speak the provided text using a random German voice.
   * @param {string} text
   */
  function speak(text) {
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
    nextUtterance.lang = voice.lang;

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
  }

  /**
   * Toggle between speaking and stopped states for the given text.
   * @param {string} text
   */
  function toggle(text) {
    if (!available) {
      return;
    }

    if (speaking) {
      stop();
      return;
    }

    speak(text);
  }

  /** Initialize speech synthesis listeners and initial state. */
  function init() {
    updateAvailability();
    if ("speechSynthesis" in window) {
      window.speechSynthesis.addEventListener("voiceschanged", () => {
        updateAvailability();
      });
    }
  }

  /** Read the current TTS state snapshot. */
  function getState() {
    return { available, speaking, voice, utterance };
  }

  return {
    init,
    updateAvailability,
    stop,
    speak,
    toggle,
    getState,
  };
}
