/**
 * Tests for TTS controller behavior with mocked speech synthesis.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { createDom, cleanupDom } from "./helpers/dom.js";
import { createTtsController } from "../src/features/tts.js";

/**
 * Build a mock SpeechSynthesisVoice entry.
 * @param {string} lang
 * @returns {{lang: string, name: string}}
 */
const makeVoice = (lang) => ({ lang, name: lang });

/**
 * Configure a mocked speechSynthesis API for tests.
 * @param {JSDOM} dom
 * @param {Array<{lang: string, name: string}>} voices
 * @returns {object}
 */
const setupSpeechSynthesis = (dom, voices = []) => {
  let cancelCalled = false;
  let speakCalledWith = null;
  const listeners = new Map();

  dom.window.speechSynthesis = {
    speaking: false,
    pending: false,
    getVoices: () => voices,
    cancel: () => {
      cancelCalled = true;
    },
    speak: (utterance) => {
      speakCalledWith = utterance;
    },
    addEventListener: (event, handler) => {
      listeners.set(event, handler);
    },
  };

  const Utterance = class {
    constructor(text) {
      this.text = text;
      this.voice = null;
      this.lang = "";
      this.onend = null;
      this.onerror = null;
    }
  };
  dom.window.SpeechSynthesisUtterance = Utterance;
  global.SpeechSynthesisUtterance = Utterance;

  return {
    get cancelCalled() {
      return cancelCalled;
    },
    get speakCalledWith() {
      return speakCalledWith;
    },
    trigger: (event) => {
      const handler = listeners.get(event);
      if (handler) handler();
    },
  };
};

test("Reports unavailable TTS when speech synthesis is missing", () => {
  const dom = createDom();
  const states = [];
  const controller = createTtsController({
    onStatusChange: (state) => states.push(state),
  });

  controller.updateAvailability();
  const latest = states.at(-1);
  assert.equal(latest.available, false);
  assert.equal(latest.voice, null);

  cleanupDom(dom);
});

test("Selects a German voice and toggles speaking", () => {
  const dom = createDom();
  const tracker = setupSpeechSynthesis(dom, [makeVoice("de-DE"), makeVoice("en-US")]);
  const states = [];
  const controller = createTtsController({
    onStatusChange: (state) => states.push(state),
  });

  controller.init();
  const initial = states.at(-1);
  assert.equal(initial.available, true);
  assert.equal(initial.voice.lang, "de-DE");

  controller.speak(" Hallo ");
  const speakState = controller.getState();
  assert.equal(speakState.speaking, true);
  assert.ok(tracker.speakCalledWith);
  assert.equal(tracker.speakCalledWith.text, "Hallo");

  dom.window.speechSynthesis.speaking = true;
  controller.toggle("Hallo");
  const stoppedState = controller.getState();
  assert.equal(stoppedState.speaking, false);
  assert.equal(tracker.cancelCalled, true);

  cleanupDom(dom);
  delete global.SpeechSynthesisUtterance;
});

test("Skips speaking with empty or non-German voices", () => {
  const dom = createDom();
  const tracker = setupSpeechSynthesis(dom, [makeVoice("en-US")]);
  const controller = createTtsController();

  controller.updateAvailability();
  controller.speak("Test");
  assert.equal(tracker.speakCalledWith, null);

  const tracker2 = setupSpeechSynthesis(dom, [makeVoice("de-DE")]);
  controller.updateAvailability();
  controller.speak("   ");
  assert.equal(tracker2.speakCalledWith, null);

  cleanupDom(dom);
  delete global.SpeechSynthesisUtterance;
});

test("Stops speech and resets speaking state on end/error", () => {
  const dom = createDom();
  const tracker = setupSpeechSynthesis(dom, [makeVoice("de-DE")]);
  const states = [];
  const controller = createTtsController({
    onStatusChange: (state) => states.push(state),
  });

  controller.updateAvailability();
  controller.speak("Hallo");
  const stateAfterSpeak = controller.getState();
  assert.equal(stateAfterSpeak.speaking, true);

  tracker.speakCalledWith.onend();
  const stateAfterEnd = controller.getState();
  assert.equal(stateAfterEnd.speaking, false);

  controller.speak("Hallo");
  tracker.speakCalledWith.onerror();
  const stateAfterError = controller.getState();
  assert.equal(stateAfterError.speaking, false);

  dom.window.speechSynthesis.speaking = true;
  controller.stop();
  const stateAfterStop = controller.getState();
  assert.equal(tracker.cancelCalled, true);
  assert.equal(stateAfterStop.speaking, false);
  assert.ok(states.length > 0);

  cleanupDom(dom);
  delete global.SpeechSynthesisUtterance;
});

test("Updates availability on voiceschanged event", () => {
  const dom = createDom();
  const voices = [];
  const tracker = setupSpeechSynthesis(dom, voices);
  const states = [];
  const controller = createTtsController({
    onStatusChange: (state) => states.push(state),
  });

  controller.init();
  const initial = states.at(-1);
  assert.equal(initial.available, false);

  voices.push(makeVoice("de-DE"));
  tracker.trigger("voiceschanged");
  const updated = states.at(-1);
  assert.equal(updated.available, true);

  cleanupDom(dom);
  delete global.SpeechSynthesisUtterance;
});

test("Handles stop/toggle when speech synthesis is missing", () => {
  const dom = createDom();
  const controller = createTtsController();

  controller.stop();
  controller.toggle("Hallo");

  const voices = [makeVoice("de-DE")];
  const tracker = setupSpeechSynthesis(dom, voices);
  controller.updateAvailability();

  voices.length = 0;
  controller.speak("Hallo");
  assert.equal(tracker.speakCalledWith, null);

  voices.push(makeVoice("de-DE"));
  controller.updateAvailability();
  controller.toggle("Hallo");
  assert.ok(tracker.speakCalledWith);

  cleanupDom(dom);
  delete global.SpeechSynthesisUtterance;
});

test("Cancels speech when pending", () => {
  const dom = createDom();
  const tracker = setupSpeechSynthesis(dom, [makeVoice("de-DE")]);
  const controller = createTtsController();

  controller.updateAvailability();
  dom.window.speechSynthesis.speaking = false;
  dom.window.speechSynthesis.pending = false;
  controller.stop();
  assert.equal(tracker.cancelCalled, false);

  dom.window.speechSynthesis.pending = true;
  controller.stop();
  assert.equal(tracker.cancelCalled, true);

  cleanupDom(dom);
  delete global.SpeechSynthesisUtterance;
});

test("Handles loss of German voices after availability", () => {
  const dom = createDom();
  const voices = [makeVoice("de-DE")];
  const tracker = setupSpeechSynthesis(dom, voices);
  const controller = createTtsController();

  controller.updateAvailability();
  voices.length = 0;
  controller.speak("Hallo");
  assert.equal(tracker.speakCalledWith, null);

  cleanupDom(dom);
  delete global.SpeechSynthesisUtterance;
});

test("Ignores voices without language tags", () => {
  const dom = createDom();
  const voices = [{ lang: "" }, makeVoice("de-DE")];
  const controller = createTtsController();
  setupSpeechSynthesis(dom, voices);

  controller.updateAvailability();
  const state = controller.getState();
  assert.equal(state.available, true);
  assert.equal(state.voice.lang, "de-DE");

  cleanupDom(dom);
  delete global.SpeechSynthesisUtterance;
});

test("Ignores null text input", () => {
  const dom = createDom();
  const tracker = setupSpeechSynthesis(dom, [makeVoice("de-DE")]);
  const controller = createTtsController();

  controller.updateAvailability();
  controller.speak(null);
  assert.equal(tracker.speakCalledWith, null);

  cleanupDom(dom);
  delete global.SpeechSynthesisUtterance;
});


test("Init reports unavailable TTS when speech synthesis is missing", () => {
  const dom = createDom();
  const states = [];
  const controller = createTtsController({
    onStatusChange: (state) => states.push(state),
  });

  controller.init();
  const latest = states.at(-1);
  assert.equal(latest.available, false);

  cleanupDom(dom);
});

test("Cancels speech when speaking and pending", () => {
  const dom = createDom();
  const tracker = setupSpeechSynthesis(dom, [makeVoice("de-DE")]);
  const controller = createTtsController();

  controller.updateAvailability();
  dom.window.speechSynthesis.speaking = true;
  dom.window.speechSynthesis.pending = true;
  controller.stop();
  assert.equal(tracker.cancelCalled, true);

  cleanupDom(dom);
  delete global.SpeechSynthesisUtterance;
});
