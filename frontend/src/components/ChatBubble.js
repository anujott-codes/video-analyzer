/**
 * ChatBubble — Chat message bubble for user or AI
 * @param {Object} options
 * @param {'user'|'ai'} options.sender
 * @param {string} options.text
 * @returns {HTMLElement}
 */
export function createChatBubble({ sender, text }) {
  const bubble = document.createElement('div');
  bubble.classList.add('chat-bubble');
  bubble.classList.add(sender === 'user' ? 'chat-bubble--user' : 'chat-bubble--ai');

  // Label
  const label = document.createElement('div');
  label.classList.add('chat-bubble__label');
  label.textContent = sender === 'user' ? 'You' : 'VidMind AI';
  bubble.appendChild(label);

  // Content
  const content = document.createElement('div');

  if (sender === 'ai') {
    // Basic markdown: **bold** and \n → <br>
    content.innerHTML = renderMarkdown(text);
  } else {
    content.textContent = text;
  }

  bubble.appendChild(content);

  return bubble;
}

/**
 * Minimal markdown renderer for AI messages
 * Supports: **bold** and newlines
 */
function renderMarkdown(text) {
  // Escape HTML to prevent XSS
  let safe = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // **bold**
  safe = safe.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // Newlines to <br>
  safe = safe.replace(/\n/g, '<br>');

  return safe;
}
