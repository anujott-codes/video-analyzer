/**
 * WaveformVisualizer — Animated audio waveform bars
 * @returns {{ element: HTMLElement, start: Function, stop: Function }}
 */
export function createWaveformVisualizer() {
  const BAR_COUNT = 35;

  const container = document.createElement('div');
  container.classList.add('waveform');

  const bars = [];

  for (let i = 0; i < BAR_COUNT; i++) {
    const bar = document.createElement('div');
    bar.classList.add('waveform__bar');

    const delay = (Math.random() * 0.8).toFixed(2);
    const duration = (0.5 + Math.random() * 0.5).toFixed(2);

    bar.style.animationDelay = `${delay}s`;
    bar.style.animationDuration = `${duration}s`;
    bar.style.height = `${10 + Math.random() * 50}px`;

    container.appendChild(bar);
    bars.push(bar);
  }

  function start() {
    container.style.display = 'flex';
    container.style.opacity = '1';
    bars.forEach((bar) => {
      bar.style.animationPlayState = 'running';
    });
  }

  function stop() {
    bars.forEach((bar) => {
      bar.style.animationPlayState = 'paused';
    });
    // Fade out
    container.style.transition = 'opacity 0.5s ease';
    container.style.opacity = '0';
  }

  return { element: container, start, stop };
}
