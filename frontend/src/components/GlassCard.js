/**
 * GlassCard — Glassmorphism card component
 * @param {Object} options
 * @param {string} options.icon — emoji or text icon
 * @param {string} options.title
 * @param {string} options.description
 * @returns {HTMLElement}
 */
export function createGlassCard({ icon, title, description }) {
  const card = document.createElement('div');
  card.classList.add('glass-card');

  const iconEl = document.createElement('div');
  iconEl.classList.add('glass-card__icon');
  iconEl.textContent = icon;

  const titleEl = document.createElement('h4');
  titleEl.classList.add('glass-card__title');
  titleEl.textContent = title;

  const descEl = document.createElement('p');
  descEl.classList.add('glass-card__desc');
  descEl.textContent = description;

  card.appendChild(iconEl);
  card.appendChild(titleEl);
  card.appendChild(descEl);

  return card;
}
