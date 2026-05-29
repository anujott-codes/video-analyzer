/* ═══════════════════════════════════════════════════════════
   VidMind — Global State Store
   Simple reactive state management (pub/sub)
   ═══════════════════════════════════════════════════════════ */

const state = {
  // Transcription
  transcript: null,
  numChunks: 0,
  sourceType: null,

  // Summary
  title: null,
  summary: null,

  // Extraction
  actionItems: null,
  decisions: null,
  questions: null,

  // Chat
  chatHistory: [],

  // UI
  isProcessing: false,
  currentStep: 0, // 0=idle, 1=transcribing, 2=summarizing, 3=extracting, 4=done
  error: null,
};

const listeners = new Set();

/**
 * Get the current state (read-only snapshot).
 */
export function getState() {
  return { ...state };
}

/**
 * Update state and notify listeners.
 * @param {Partial<typeof state>} updates
 */
export function setState(updates) {
  Object.assign(state, updates);
  listeners.forEach((fn) => fn(getState()));
}

/**
 * Subscribe to state changes.
 * @param {(state: typeof state) => void} fn
 * @returns {() => void} unsubscribe function
 */
export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/**
 * Add a chat message.
 * @param {'user' | 'ai'} sender
 * @param {string} text
 */
export function addChatMessage(sender, text) {
  state.chatHistory = [...state.chatHistory, { sender, text, time: Date.now() }];
  listeners.forEach((fn) => fn(getState()));
}

/**
 * Reset all analysis data (keeps chat history).
 */
export function resetAnalysis() {
  setState({
    transcript: null,
    numChunks: 0,
    sourceType: null,
    title: null,
    summary: null,
    actionItems: null,
    decisions: null,
    questions: null,
    isProcessing: false,
    currentStep: 0,
    error: null,
    chatHistory: [],
  });
}
