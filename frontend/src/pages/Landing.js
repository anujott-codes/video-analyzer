/* ═══════════════════════════════════════════════════════════
   VidMind — Landing Page
   Cinematic hero, features grid, how-it-works, footer
   ═══════════════════════════════════════════════════════════ */

import { createGlassCard } from '../components/GlassCard.js';
import { createGlowButton } from '../components/GlowButton.js';
import { wrapWithAnimatedBorder } from '../components/AnimatedBorder.js';
import { initScrollReveal } from '../components/ScrollReveal.js';
import { navigate } from '../router.js';

/**
 * Render the Landing page.
 * @returns {HTMLElement}
 */
export function renderLanding() {
  const page = document.createElement('div');
  page.className = 'page-container';

  // ── Hero Section ──────────────────────────────────────────
  const hero = document.createElement('section');
  hero.className = 'hero';

  // Gradient orbs
  for (let i = 1; i <= 3; i++) {
    const orb = document.createElement('div');
    orb.className = `hero__orb hero__orb--${i}`;
    hero.appendChild(orb);
  }

  // Badge
  const badge = document.createElement('div');
  badge.className = 'badge hero__badge';
  badge.textContent = 'AI-Powered Video Intelligence';
  hero.appendChild(badge);

  // Title
  const title = document.createElement('h1');
  title.className = 'hero__title';
  title.innerHTML = 'Decode Any Video<br><span class="text-gradient">with AI</span>';
  hero.appendChild(title);

  // Subtitle
  const subtitle = document.createElement('p');
  subtitle.className = 'hero__subtitle';
  subtitle.textContent =
    'Transcribe, summarize, extract key insights, and chat with your video content — all powered by advanced AI.';
  hero.appendChild(subtitle);

  // Actions
  const actions = document.createElement('div');
  actions.className = 'hero__actions';

  const startBtn = createGlowButton({
    text: 'Start Analyzing',
    onClick: () => navigate('/analyze'),
    icon: '→',
  });

  const learnBtn = createGlowButton({
    text: 'Learn More',
    variant: 'ghost',
    onClick: () => {
      const featuresEl = page.querySelector('.features-section');
      if (featuresEl) featuresEl.scrollIntoView({ behavior: 'smooth' });
    },
  });

  actions.appendChild(startBtn);
  actions.appendChild(learnBtn);
  hero.appendChild(actions);

  // Scroll indicator
  const scrollIndicator = document.createElement('div');
  scrollIndicator.className = 'hero__scroll-indicator';
  scrollIndicator.textContent = '↓';
  hero.appendChild(scrollIndicator);

  page.appendChild(hero);

  // ── Features Section ──────────────────────────────────────
  const features = document.createElement('section');
  features.className = 'features-section container scroll-reveal stagger-children';

  const sectionHeader = document.createElement('div');
  sectionHeader.className = 'section-header';

  const label = document.createElement('div');
  label.className = 'label section-header__label';
  label.textContent = 'FEATURES';

  const heading = document.createElement('h2');
  heading.innerHTML = 'Everything You Need to<span class="text-gradient"> Analyze Videos</span>';

  const desc = document.createElement('p');
  desc.className = 'section-header__desc';
  desc.textContent = 'From raw video to actionable insights in minutes';

  sectionHeader.appendChild(label);
  sectionHeader.appendChild(heading);
  sectionHeader.appendChild(desc);
  features.appendChild(sectionHeader);

  const grid = document.createElement('div');
  grid.className = 'features-grid';

  const cards = [
    {
      icon: '🎙️',
      title: 'Smart Transcription',
      description:
        'Upload any video or paste a YouTube URL. Powered by OpenAI Whisper for accurate, multi-language transcription with optional English translation.',
    },
    {
      icon: '📋',
      title: 'AI Summary',
      description:
        'Get concise bullet-point summaries with auto-generated titles. Understand hours of content in seconds.',
    },
    {
      icon: '✅',
      title: 'Action Extraction',
      description:
        'Automatically extract action items with owners and deadlines, key decisions, and follow-up questions.',
    },
    {
      icon: '💬',
      title: 'RAG Chat',
      description:
        'Chat with your video content using AI-powered retrieval. Ask any question and get answers grounded in the transcript.',
    },
  ];

  cards.forEach((cfg) => {
    const card = createGlassCard(cfg);
    const wrapped = wrapWithAnimatedBorder(card);
    grid.appendChild(wrapped);
  });

  features.appendChild(grid);
  page.appendChild(features);

  // ── How It Works Section ──────────────────────────────────
  const how = document.createElement('section');
  how.className = 'how-section container scroll-reveal';

  const howHeader = document.createElement('div');
  howHeader.className = 'section-header';

  const howLabel = document.createElement('div');
  howLabel.className = 'label section-header__label';
  howLabel.textContent = 'HOW IT WORKS';

  const howHeading = document.createElement('h2');
  howHeading.textContent = 'Three Simple Steps';

  howHeader.appendChild(howLabel);
  howHeader.appendChild(howHeading);
  how.appendChild(howHeader);

  const stepsRow = document.createElement('div');
  stepsRow.className = 'steps-row';

  const steps = [
    { number: '1', title: 'Upload', desc: 'Paste a YouTube URL or upload a local video/audio file' },
    { number: '2', title: 'Analyze', desc: 'AI transcribes, summarizes, and extracts insights automatically' },
    { number: '3', title: 'Explore', desc: 'Browse results across tabs and chat with your video content' },
  ];

  steps.forEach((s) => {
    const card = document.createElement('div');
    card.className = 'step-card';

    const num = document.createElement('div');
    num.className = 'step-card__number';
    num.textContent = s.number;

    const t = document.createElement('div');
    t.className = 'step-card__title';
    t.textContent = s.title;

    const d = document.createElement('div');
    d.className = 'step-card__desc';
    d.textContent = s.desc;

    card.appendChild(num);
    card.appendChild(t);
    card.appendChild(d);
    stepsRow.appendChild(card);
  });

  how.appendChild(stepsRow);
  page.appendChild(how);

  // ── Footer ────────────────────────────────────────────────
  const footer = document.createElement('footer');
  footer.className = 'footer';

  const footerContainer = document.createElement('div');
  footerContainer.className = 'container';

  const footerContent = document.createElement('div');
  footerContent.className = 'footer__content';

  const footerText = document.createElement('span');
  footerText.className = 'footer__text';
  footerText.textContent = '© 2025 VidMind. All rights reserved.';

  const footerBadge = document.createElement('span');
  footerBadge.className = 'footer__badge';
  footerBadge.textContent = '⚡ Built with AI';

  footerContent.appendChild(footerText);
  footerContent.appendChild(footerBadge);
  footerContainer.appendChild(footerContent);
  footer.appendChild(footerContainer);
  page.appendChild(footer);

  // ── Activate scroll reveal after DOM insertion ────────────
  requestAnimationFrame(() => initScrollReveal());

  return page;
}
