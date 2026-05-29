/* ═══════════════════════════════════════════════════════════
   VidMind — Hash-Based SPA Router
   Smooth page transitions with CSS animation orchestration
   ═══════════════════════════════════════════════════════════ */

const routes = {};
let currentPage = null;
let container = null;

/**
 * Register a route.
 * @param {string} path — e.g. '/', '/analyze', '/results', '/chat'
 * @param {() => HTMLElement} renderFn — returns the page DOM element
 */
export function addRoute(path, renderFn) {
  routes[path] = renderFn;
}

/**
 * Initialize the router.
 * @param {HTMLElement} mountEl — the container to mount pages into
 */
export function initRouter(mountEl) {
  container = mountEl;
  window.addEventListener('hashchange', () => handleRoute());
  handleRoute();
}

/**
 * Navigate to a route programmatically.
 * @param {string} path
 */
export function navigate(path) {
  window.location.hash = `#${path}`;
}

/**
 * Get the current route path.
 */
export function getCurrentRoute() {
  const hash = window.location.hash.replace('#', '') || '/';
  return hash;
}

async function handleRoute() {
  const path = getCurrentRoute();
  const renderFn = routes[path] || routes['/'];

  if (!renderFn || !container) return;

  // Exit animation for current page
  if (currentPage) {
    currentPage.classList.add('animate-page-exit');
    await wait(150);
    currentPage.remove();
  }

  // Render new page
  const page = renderFn();
  page.classList.add('page', 'animate-page-enter');
  container.appendChild(page);
  currentPage = page;

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'instant' });

  // Update navbar active state
  document.querySelectorAll('.navbar__link').forEach((link) => {
    const href = link.getAttribute('data-route');
    link.classList.toggle('active', href === path);
  });
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
