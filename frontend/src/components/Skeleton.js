/**
 * Skeleton — Loading placeholder elements
 * @param {Object} options
 * @param {'lines'|'title'|'card'} options.type
 * @returns {HTMLElement}
 */
export function createSkeleton({ type }) {
  if (type === 'lines') {
    const container = document.createElement('div');
    for (let i = 0; i < 4; i++) {
      const line = document.createElement('div');
      line.classList.add('skeleton', 'skeleton--line');
      container.appendChild(line);
    }
    return container;
  }

  if (type === 'title') {
    const el = document.createElement('div');
    el.classList.add('skeleton', 'skeleton--title');
    return el;
  }

  if (type === 'card') {
    const el = document.createElement('div');
    el.classList.add('skeleton', 'skeleton--card');
    return el;
  }

  // Fallback
  const el = document.createElement('div');
  el.classList.add('skeleton');
  return el;
}
