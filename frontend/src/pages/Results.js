/* ═══════════════════════════════════════════════════════════
   VidMind — Results Page
   Tabbed display of analysis output with copy & chat CTA
   ═══════════════════════════════════════════════════════════ */

import { createTabSwitcher } from '../components/TabSwitcher.js';
import { getState } from '../state.js';
import { navigate } from '../router.js';

/**
 * Render the Results page.
 * @returns {HTMLElement}
 */
export function renderResults() {
  const state = getState();

  // Guard — redirect if no data
  if (!state.transcript) {
    requestAnimationFrame(() => navigate('/analyze'));
    const empty = document.createElement('div');
    empty.className = 'page-container';
    return empty;
  }

  const page = document.createElement('div');
  page.className = 'page-container';

  const container = document.createElement('div');
  container.className = 'container';

  const resultsPage = document.createElement('div');
  resultsPage.className = 'results-page';

  // ── Header ────────────────────────────────────────────────
  const header = document.createElement('div');
  header.className = 'results-header';

  const h2 = document.createElement('h2');
  h2.textContent = state.title || 'Analysis Results';
  header.appendChild(h2);

  const meta = document.createElement('div');
  meta.className = 'results-meta';

  const srcBadge = document.createElement('span');
  srcBadge.className = 'badge';
  srcBadge.textContent = state.sourceType === 'youtube' ? 'YouTube' : 'Upload';

  const chunkBadge = document.createElement('span');
  chunkBadge.className = 'badge';
  chunkBadge.textContent = `${state.numChunks} chunks processed`;

  meta.appendChild(srcBadge);
  meta.appendChild(chunkBadge);
  header.appendChild(meta);
  resultsPage.appendChild(header);

  // ── Tabs ──────────────────────────────────────────────────
  const tabsWrapper = document.createElement('div');
  tabsWrapper.className = 'results-tabs';

  let activeTab = 'summary';

  const tabSwitcher = createTabSwitcher({
    tabs: [
      { id: 'summary', label: 'Summary' },
      { id: 'actions', label: 'Action Items' },
      { id: 'decisions', label: 'Decisions' },
      { id: 'questions', label: 'Questions' },
    ],
    onTabChange: (tabId) => {
      activeTab = tabId;
      renderPanel();
    },
  });

  tabsWrapper.appendChild(tabSwitcher.element);
  resultsPage.appendChild(tabsWrapper);

  // ── Content Area ──────────────────────────────────────────
  const contentArea = document.createElement('div');
  contentArea.className = 'results-content';
  resultsPage.appendChild(contentArea);

  function renderPanel() {
    contentArea.innerHTML = '';

    const card = document.createElement('div');
    card.className = 'glass-card glass-card--no-hover';

    // Panel header
    const panelHeader = document.createElement('div');
    panelHeader.className = 'results-content__header';

    const panelTitle = document.createElement('h4');
    const titles = {
      summary: 'Summary',
      actions: 'Action Items',
      decisions: 'Decisions',
      questions: 'Questions',
    };
    panelTitle.textContent = titles[activeTab] || 'Summary';

    const copyBtn = document.createElement('button');
    copyBtn.className = 'copy-btn';
    copyBtn.textContent = '📋 Copy';
    copyBtn.addEventListener('click', () => {
      const text = getTabText(activeTab);
      navigator.clipboard.writeText(text).then(() => {
        copyBtn.classList.add('copied');
        copyBtn.textContent = '✓ Copied!';
        setTimeout(() => {
          copyBtn.classList.remove('copied');
          copyBtn.textContent = '📋 Copy';
        }, 2000);
      });
    });

    panelHeader.appendChild(panelTitle);
    panelHeader.appendChild(copyBtn);
    card.appendChild(panelHeader);

    // Panel body
    if (activeTab === 'summary') {
      const block = document.createElement('div');
      block.className = 'content-block';
      block.textContent = state.summary || 'No summary available.';
      card.appendChild(block);
    } else {
      const dataMap = {
        actions: state.actionItems,
        decisions: state.decisions,
        questions: state.questions,
      };
      const raw = dataMap[activeTab] || '';
      const items = raw
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean);

      if (items.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'content-block';
        empty.textContent = 'No items found.';
        card.appendChild(empty);
      } else {
        const list = document.createElement('div');
        list.className = 'result-list';

        items.forEach((item) => {
          const el = document.createElement('div');
          el.className = 'result-list__item';
          el.textContent = item;
          list.appendChild(el);
        });

        card.appendChild(list);
      }
    }

    contentArea.appendChild(card);
  }

  function getTabText(tab) {
    if (tab === 'summary') return state.summary || '';
    const map = {
      actions: state.actionItems,
      decisions: state.decisions,
      questions: state.questions,
    };
    return map[tab] || '';
  }

  // Initial panel render
  renderPanel();

  // ── Chat CTA ──────────────────────────────────────────────
  const chatCta = document.createElement('div');
  chatCta.className = 'chat-cta';
  chatCta.addEventListener('click', () => navigate('/chat'));

  const ctaText = document.createElement('span');
  ctaText.className = 'chat-cta__text';
  ctaText.innerHTML = 'Have more questions? <strong>Chat with your video →</strong>';

  const ctaArrow = document.createElement('span');
  ctaArrow.className = 'chat-cta__arrow';
  ctaArrow.textContent = '→';

  chatCta.appendChild(ctaText);
  chatCta.appendChild(ctaArrow);
  resultsPage.appendChild(chatCta);

  container.appendChild(resultsPage);
  page.appendChild(container);

  return page;
}
