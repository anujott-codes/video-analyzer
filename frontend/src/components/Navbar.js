/**
 * Navbar — Fixed top navigation bar
 * @returns {HTMLElement}
 */
export function createNavbar() {
  const nav = document.createElement('nav');
  nav.classList.add('navbar');

  // ── Logo ──
  const logo = document.createElement('div');
  logo.classList.add('navbar__logo');
  logo.addEventListener('click', () => {
    window.location.hash = '#/';
  });

  const logoIcon = document.createElement('div');
  logoIcon.classList.add('navbar__logo-icon');
  logoIcon.innerHTML = `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 2.5L15 9L4 15.5V2.5Z" fill="#000000"/>
  </svg>`;

  const logoText = document.createElement('span');
  logoText.textContent = 'VidMind';

  logo.appendChild(logoIcon);
  logo.appendChild(logoText);

  // ── Navigation Links ──
  const navLinks = document.createElement('div');
  navLinks.classList.add('navbar__nav');

  const routes = [
    { path: '/', label: 'Home' },
    { path: '/analyze', label: 'Analyze' },
    { path: '/results', label: 'Results' },
    { path: '/chat', label: 'Chat' },
  ];

  routes.forEach(({ path, label }) => {
    const link = document.createElement('a');
    link.classList.add('navbar__link');
    link.setAttribute('data-route', path);
    link.setAttribute('href', `#${path}`);
    link.textContent = label;

    link.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.hash = '#' + path;
    });

    navLinks.appendChild(link);
  });

  nav.appendChild(logo);
  nav.appendChild(navLinks);

  // ── Scroll listener for .scrolled class ──
  function onScroll() {
    if (window.scrollY > 20) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  // Check initial state
  onScroll();

  return nav;
}
