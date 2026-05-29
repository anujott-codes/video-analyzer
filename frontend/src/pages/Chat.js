/* ═══════════════════════════════════════════════════════════
   VidMind — Chat Page
   Full-height chat interface with RAG-powered Q&A
   ═══════════════════════════════════════════════════════════ */

import { createChatBubble } from '../components/ChatBubble.js';
import { createGlowButton } from '../components/GlowButton.js';
import { chat } from '../api.js';
import { getState, addChatMessage } from '../state.js';
import { navigate } from '../router.js';

/**
 * Render the Chat page.
 * @returns {HTMLElement}
 */
export function renderChat() {
  const state = getState();

  // Guard — redirect if no transcript
  if (!state.transcript) {
    requestAnimationFrame(() => navigate('/analyze'));
    const empty = document.createElement('div');
    empty.className = 'page-container';
    return empty;
  }

  const page = document.createElement('div');
  page.className = 'chat-page';

  // ── Header ────────────────────────────────────────────────
  const header = document.createElement('div');
  header.className = 'chat-header';

  const headerRow = document.createElement('div');
  headerRow.style.cssText = 'display:flex;justify-content:space-between;align-items:flex-start;';

  const headerLeft = document.createElement('div');

  const h3 = document.createElement('h3');
  h3.textContent = 'Chat with Your Video';

  const subtitle = document.createElement('div');
  subtitle.className = 'chat-header__subtitle';
  subtitle.textContent = state.title || 'Video Analysis';

  headerLeft.appendChild(h3);
  headerLeft.appendChild(subtitle);

  const backLink = document.createElement('a');
  backLink.className = 'chat-header__back';
  backLink.textContent = '← Back to Results';
  backLink.addEventListener('click', (e) => {
    e.preventDefault();
    navigate('/results');
  });

  headerRow.appendChild(headerLeft);
  headerRow.appendChild(backLink);
  header.appendChild(headerRow);
  page.appendChild(header);

  // ── Messages ──────────────────────────────────────────────
  const messagesContainer = document.createElement('div');
  messagesContainer.className = 'chat-messages';

  // Welcome message
  const welcomeBubble = createChatBubble({
    sender: 'ai',
    text: "👋 I've analyzed your video. Ask me anything about its content!",
  });
  messagesContainer.appendChild(welcomeBubble);

  // Render existing chat history
  state.chatHistory.forEach((msg) => {
    const bubble = createChatBubble({ sender: msg.sender, text: msg.text });
    messagesContainer.appendChild(bubble);
  });

  page.appendChild(messagesContainer);

  // ── Input bar ─────────────────────────────────────────────
  const inputBar = document.createElement('div');
  inputBar.className = 'chat-input-bar';

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'text-input';
  input.placeholder = 'Ask about your video...';

  const sendBtn = createGlowButton({
    text: '→',
    onClick: () => sendMessage(),
    size: 'sm',
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  });

  inputBar.appendChild(input);
  inputBar.appendChild(sendBtn);
  page.appendChild(inputBar);

  // ── Send message logic ────────────────────────────────────
  let isSending = false;

  async function sendMessage() {
    const question = input.value.trim();
    if (!question || isSending) return;

    isSending = true;
    input.value = '';

    // User bubble
    addChatMessage('user', question);
    const userBubble = createChatBubble({ sender: 'user', text: question });
    messagesContainer.appendChild(userBubble);
    scrollToBottom();

    // Typing indicator
    const typingEl = createTypingIndicator();
    messagesContainer.appendChild(typingEl);
    scrollToBottom();

    try {
      const result = await chat(question);
      typingEl.remove();

      addChatMessage('ai', result.answer);
      const aiBubble = createChatBubble({ sender: 'ai', text: result.answer });
      messagesContainer.appendChild(aiBubble);
    } catch (err) {
      typingEl.remove();

      const errBubble = createChatBubble({
        sender: 'ai',
        text: `⚠️ Error: ${err.message}. Please try again.`,
      });
      messagesContainer.appendChild(errBubble);
    }

    isSending = false;
    scrollToBottom();
    input.focus();
  }

  // ── Helpers ───────────────────────────────────────────────
  function scrollToBottom() {
    requestAnimationFrame(() => {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    });
  }

  function createTypingIndicator() {
    const wrapper = document.createElement('div');
    wrapper.className = 'chat-bubble chat-bubble--ai';
    wrapper.style.maxWidth = '80px';

    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator';

    for (let i = 0; i < 3; i++) {
      const dot = document.createElement('span');
      indicator.appendChild(dot);
    }

    wrapper.appendChild(indicator);
    return wrapper;
  }

  // Initial scroll
  requestAnimationFrame(() => scrollToBottom());

  return page;
}
