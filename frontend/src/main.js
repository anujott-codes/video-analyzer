/* ═══════════════════════════════════════════════════════════
   VidMind — Application Entry Point
   Bootstrap app shell, router, background effects
   ═══════════════════════════════════════════════════════════ */

import './styles/index.css';
import { addRoute, initRouter } from './router.js';
import { createNavbar } from './components/Navbar.js';
import { initParticleCanvas } from './components/ParticleCanvas.js';
import { initMouseGlow } from './components/MouseGlow.js';
import { renderLanding } from './pages/Landing.js';
import { renderAnalyze } from './pages/Analyze.js';
import { renderResults } from './pages/Results.js';
import { renderChat } from './pages/Chat.js';

function init() {
  const app = document.getElementById('app');

  // ── Navbar ──────────────────────────────────────────────
  const navbar = createNavbar();
  app.appendChild(navbar);

  // ── Background Effects ──────────────────────────────────
  initParticleCanvas(app);
  initMouseGlow(app);

  // ── Page Container ──────────────────────────────────────
  const pageContainer = document.createElement('div');
  pageContainer.className = 'page-transition-wrapper';
  app.appendChild(pageContainer);

  // ── Register Routes ─────────────────────────────────────
  addRoute('/', renderLanding);
  addRoute('/analyze', renderAnalyze);
  addRoute('/results', renderResults);
  addRoute('/chat', renderChat);

  // ── Start Router ────────────────────────────────────────
  initRouter(pageContainer);

  // ── Initialize Lucide Icons ─────────────────────────────
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// Boot when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
