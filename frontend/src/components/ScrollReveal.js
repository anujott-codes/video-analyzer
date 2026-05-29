/**
 * ScrollReveal — Reveal elements on scroll using IntersectionObserver
 * @returns {Function} cleanup
 */
export function initScrollReveal() {
  const SELECTORS = '.scroll-reveal, .scroll-reveal-scale, .stagger-children';

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target); // one-shot
        }
      });
    },
    { threshold: 0.15 }
  );

  // Observe all matching elements
  const elements = document.querySelectorAll(SELECTORS);
  elements.forEach((el) => observer.observe(el));

  return function cleanup() {
    observer.disconnect();
  };
}
