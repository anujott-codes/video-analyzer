/**
 * TabSwitcher — Horizontal tab bar with sliding indicator
 * @param {Object} options
 * @param {{ id: string, label: string }[]} options.tabs
 * @param {Function} [options.onTabChange] — called with tab id
 * @returns {{ element: HTMLElement, setActiveTab: Function }}
 */
export function createTabSwitcher({ tabs, onTabChange }) {
  const container = document.createElement('div');
  container.classList.add('tabs');

  // Indicator
  const indicator = document.createElement('div');
  indicator.classList.add('tabs__indicator');
  indicator.style.width = `calc(${100 / tabs.length}% - 4px)`;
  container.appendChild(indicator);

  const buttons = [];
  let activeIndex = 0;

  tabs.forEach((tab, index) => {
    const btn = document.createElement('button');
    btn.classList.add('tabs__btn');
    btn.textContent = tab.label;
    btn.setAttribute('data-tab-id', tab.id);

    if (index === 0) {
      btn.classList.add('active');
    }

    btn.addEventListener('click', () => {
      switchTo(index);
      if (typeof onTabChange === 'function') {
        onTabChange(tab.id);
      }
    });

    container.appendChild(btn);
    buttons.push(btn);
  });

  function switchTo(index) {
    if (index === activeIndex && buttons[index].classList.contains('active')) return;
    activeIndex = index;

    // Update active class
    buttons.forEach((b) => b.classList.remove('active'));
    buttons[index].classList.add('active');

    // Move indicator
    indicator.style.transform = `translateX(${index * 100}%)`;
  }

  function setActiveTab(id) {
    const idx = tabs.findIndex((t) => t.id === id);
    if (idx !== -1) {
      switchTo(idx);
    }
  }

  return { element: container, setActiveTab };
}
