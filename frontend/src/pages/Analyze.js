/* ═══════════════════════════════════════════════════════════
   VidMind — Analyze Page
   Upload / URL input → processing pipeline → redirect
   ═══════════════════════════════════════════════════════════ */

import { createGlowButton } from '../components/GlowButton.js';
import { createWaveformVisualizer } from '../components/WaveformVisualizer.js';
import { transcribe, summarize, extract } from '../api.js';
import { getState, setState, resetAnalysis } from '../state.js';
import { navigate } from '../router.js';

/**
 * Render the Analyze page.
 * @returns {HTMLElement}
 */
export function renderAnalyze() {
  const page = document.createElement('div');
  page.className = 'page-container';

  const container = document.createElement('div');
  container.className = 'container container--narrow';

  const analyzePage = document.createElement('div');
  analyzePage.className = 'analyze-page';

  const analyzeCard = document.createElement('div');
  analyzeCard.className = 'analyze-card glass-card glass-card--no-hover';

  // ── Local state ───────────────────────────────────────────
  let mode = 'youtube'; // 'youtube' | 'upload'
  let selectedFile = null;
  let translateEnabled = false;

  // ── Build the input form ──────────────────────────────────
  function buildForm() {
    analyzeCard.innerHTML = '';

    // Header
    const header = document.createElement('div');
    header.className = 'analyze-card__header';

    const h2 = document.createElement('h2');
    h2.innerHTML = '<span class="text-gradient">Analyze Your Video</span>';

    const p = document.createElement('p');
    p.textContent = 'Upload a video file or paste a YouTube URL to get started';

    header.appendChild(h2);
    header.appendChild(p);
    analyzeCard.appendChild(header);

    // Form wrapper
    const form = document.createElement('div');
    form.className = 'analyze-form';

    // ── Toggle group ──────────────────────────────────────
    const toggleGroup = document.createElement('div');
    toggleGroup.className = 'toggle-group';

    const slider = document.createElement('div');
    slider.className = 'toggle-group__slider';
    if (mode === 'upload') slider.classList.add('right');

    const ytBtn = document.createElement('div');
    ytBtn.className = `toggle-group__btn${mode === 'youtube' ? ' active' : ''}`;
    ytBtn.textContent = 'YouTube URL';

    const upBtn = document.createElement('div');
    upBtn.className = `toggle-group__btn${mode === 'upload' ? ' active' : ''}`;
    upBtn.textContent = 'Upload File';

    ytBtn.addEventListener('click', () => {
      if (mode === 'youtube') return;
      mode = 'youtube';
      slider.classList.remove('right');
      ytBtn.classList.add('active');
      upBtn.classList.remove('active');
      renderInputArea();
    });

    upBtn.addEventListener('click', () => {
      if (mode === 'upload') return;
      mode = 'upload';
      slider.classList.add('right');
      upBtn.classList.add('active');
      ytBtn.classList.remove('active');
      renderInputArea();
    });

    toggleGroup.appendChild(slider);
    toggleGroup.appendChild(ytBtn);
    toggleGroup.appendChild(upBtn);
    form.appendChild(toggleGroup);

    // ── Dynamic input area ────────────────────────────────
    const inputArea = document.createElement('div');
    inputArea.id = 'input-area';
    form.appendChild(inputArea);

    function renderInputArea() {
      inputArea.innerHTML = '';
      if (mode === 'youtube') {
        const urlInput = document.createElement('input');
        urlInput.type = 'text';
        urlInput.className = 'text-input';
        urlInput.placeholder = 'https://www.youtube.com/watch?v=...';
        urlInput.id = 'youtube-url';
        inputArea.appendChild(urlInput);
      } else {
        buildDropZone(inputArea);
      }
    }

    renderInputArea();

    // ── Translate toggle ──────────────────────────────────
    const switchRow = document.createElement('div');
    switchRow.className = 'switch-row';

    const switchLabel = document.createElement('span');
    switchLabel.className = 'switch-row__label';
    switchLabel.textContent = 'Translate to English';

    const switchEl = document.createElement('div');
    switchEl.className = `switch${translateEnabled ? ' active' : ''}`;

    const thumb = document.createElement('div');
    thumb.className = 'switch__thumb';
    switchEl.appendChild(thumb);

    switchEl.addEventListener('click', () => {
      translateEnabled = !translateEnabled;
      switchEl.classList.toggle('active', translateEnabled);
    });

    switchRow.appendChild(switchLabel);
    switchRow.appendChild(switchEl);
    form.appendChild(switchRow);

    // ── Analyze button ────────────────────────────────────
    const analyzeBtn = createGlowButton({
      text: '🔍 Analyze Video',
      onClick: startAnalysis,
    });
    form.appendChild(analyzeBtn);

    analyzeCard.appendChild(form);
  }

  // ── Drop zone builder ─────────────────────────────────────
  function buildDropZone(parent) {
    const dropZone = document.createElement('div');
    dropZone.className = 'drop-zone';

    const icon = document.createElement('div');
    icon.className = 'drop-zone__icon';
    icon.textContent = '📁';

    const text = document.createElement('p');
    text.className = 'drop-zone__text';
    text.textContent = 'Drag & drop your file here';

    const hint = document.createElement('p');
    hint.className = 'drop-zone__hint';
    hint.textContent = 'Supports MP4, MP3, WAV, WebM';

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.mp4,.mp3,.wav,.webm';
    fileInput.style.display = 'none';

    const fileNameDisplay = document.createElement('div');
    fileNameDisplay.className = 'drop-zone__file-name';
    fileNameDisplay.style.display = 'none';

    dropZone.appendChild(icon);
    dropZone.appendChild(text);
    dropZone.appendChild(hint);
    dropZone.appendChild(fileInput);
    dropZone.appendChild(fileNameDisplay);

    // Click → open file picker
    dropZone.addEventListener('click', () => fileInput.click());

    // Drag events
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('drag-over');
    });
    dropZone.addEventListener('dragleave', () => {
      dropZone.classList.remove('drag-over');
    });
    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('drag-over');
      if (e.dataTransfer.files.length) {
        selectedFile = e.dataTransfer.files[0];
        showFileName(fileNameDisplay, selectedFile.name);
      }
    });

    fileInput.addEventListener('change', () => {
      if (fileInput.files.length) {
        selectedFile = fileInput.files[0];
        showFileName(fileNameDisplay, selectedFile.name);
      }
    });

    parent.appendChild(dropZone);
  }

  function showFileName(el, name) {
    el.textContent = `📄 ${name}`;
    el.style.display = 'inline-flex';
  }

  // ── Processing view ───────────────────────────────────────
  function buildProcessing() {
    analyzeCard.innerHTML = '';

    const proc = document.createElement('div');
    proc.className = 'processing-card';

    // Waveform
    const waveform = createWaveformVisualizer();
    proc.appendChild(waveform.element);
    waveform.start();

    const h3 = document.createElement('h3');
    h3.textContent = 'Analyzing your video...';
    proc.appendChild(h3);

    const p = document.createElement('p');
    p.textContent = 'This may take a few minutes depending on video length';
    proc.appendChild(p);

    // Progress steps
    const stepsContainer = document.createElement('div');
    stepsContainer.className = 'progress-steps';

    const stepLabels = [
      'Transcribing video...',
      'Generating summary...',
      'Extracting insights...',
    ];

    const stepEls = stepLabels.map((label, idx) => {
      const step = document.createElement('div');
      step.className = 'progress-step';

      const iconEl = document.createElement('div');
      iconEl.className = 'progress-step__icon progress-step__icon--pending';
      iconEl.textContent = idx + 1;

      const textEl = document.createElement('span');
      textEl.className = 'progress-step__text';
      textEl.textContent = label;

      step.appendChild(iconEl);
      step.appendChild(textEl);
      stepsContainer.appendChild(step);
      return { step, iconEl };
    });

    proc.appendChild(stepsContainer);

    // Progress bar
    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';

    const progressFill = document.createElement('div');
    progressFill.className = 'progress-bar__fill';
    progressFill.style.width = '0%';

    progressBar.appendChild(progressFill);
    proc.appendChild(progressBar);

    analyzeCard.appendChild(proc);

    return { stepEls, progressFill, waveform };
  }

  function markStepActive(stepEls, idx) {
    const { step, iconEl } = stepEls[idx];
    step.classList.add('active');
    iconEl.className = 'progress-step__icon progress-step__icon--active';
    iconEl.innerHTML = '<div class="spinner-ring"></div>';
  }

  function markStepDone(stepEls, idx) {
    const { step, iconEl } = stepEls[idx];
    step.classList.remove('active');
    step.classList.add('done');
    iconEl.className = 'progress-step__icon progress-step__icon--done';
    iconEl.textContent = '✓';
  }

  // ── Start analysis pipeline ───────────────────────────────
  async function startAnalysis() {
    // Reset all previous state (clears transcript, summary, chat history, etc.)
    // The backend will also reset the vectorstore on the /transcribe call.
    resetAnalysis();

    // Validate input
    if (mode === 'youtube') {
      const urlInput = analyzeCard.querySelector('#youtube-url');
      const url = urlInput ? urlInput.value.trim() : '';
      if (!url) {
        showError('Please enter a YouTube URL.');
        return;
      }
    } else {
      if (!selectedFile) {
        showError('Please select a file to upload.');
        return;
      }
    }

    // Build FormData
    const formData = new FormData();
    if (mode === 'youtube') {
      const urlInput = analyzeCard.querySelector('#youtube-url');
      formData.append('youtube_url', urlInput.value.trim());
    } else {
      formData.append('file', selectedFile);
    }
    if (translateEnabled) {
      formData.append('translate', 'true');
    }

    // Switch to processing view
    setState({ isProcessing: true, currentStep: 1, error: null });
    const { stepEls, progressFill, waveform } = buildProcessing();

    try {
      // Step 1 — Transcription
      markStepActive(stepEls, 0);
      const transcriptResult = await transcribe(formData);
      setState({
        transcript: transcriptResult.transcript,
        numChunks: transcriptResult.num_chunks,
        sourceType: transcriptResult.source_type,
      });
      markStepDone(stepEls, 0);
      progressFill.style.width = '33%';

      // Step 2 — Summary
      setState({ currentStep: 2 });
      markStepActive(stepEls, 1);
      const summaryResult = await summarize(transcriptResult.transcript);
      setState({
        title: summaryResult.title,
        summary: summaryResult.summary,
      });
      markStepDone(stepEls, 1);
      progressFill.style.width = '66%';

      // Step 3 — Extraction
      setState({ currentStep: 3 });
      markStepActive(stepEls, 2);
      const extractResult = await extract(transcriptResult.transcript);
      setState({
        actionItems: extractResult.action_items,
        decisions: extractResult.decisions,
        questions: extractResult.questions,
      });
      markStepDone(stepEls, 2);
      progressFill.style.width = '100%';

      // Done
      setState({ isProcessing: false, currentStep: 4 });
      waveform.stop();

      setTimeout(() => navigate('/results'), 800);
    } catch (err) {
      waveform.stop();
      setState({ isProcessing: false, error: err.message });
      showErrorInProcessing(err.message);
    }
  }

  // ── Error helpers ─────────────────────────────────────────
  function showError(msg) {
    // Remove existing error
    const existing = analyzeCard.querySelector('.analyze-error');
    if (existing) existing.remove();

    const errEl = document.createElement('div');
    errEl.className = 'analyze-error';
    errEl.style.cssText =
      'color: #ef4444; font-size: var(--text-sm); text-align: center; padding: var(--space-sm) 0;';
    errEl.textContent = msg;

    const form = analyzeCard.querySelector('.analyze-form');
    if (form) form.prepend(errEl);
  }

  function showErrorInProcessing(msg) {
    const proc = analyzeCard.querySelector('.processing-card');
    if (!proc) return;

    const errEl = document.createElement('div');
    errEl.style.cssText =
      'color: #ef4444; text-align: center; margin-top: var(--space-lg); font-size: var(--text-sm);';
    errEl.textContent = `Error: ${msg}`;

    const retryBtn = createGlowButton({
      text: 'Retry',
      variant: 'ghost',
      onClick: () => buildForm(),
    });
    retryBtn.style.marginTop = 'var(--space-md)';

    const wrapper = document.createElement('div');
    wrapper.style.textAlign = 'center';
    wrapper.appendChild(errEl);
    wrapper.appendChild(retryBtn);
    proc.appendChild(wrapper);
  }

  // ── Initial render ────────────────────────────────────────
  buildForm();
  analyzePage.appendChild(analyzeCard);
  container.appendChild(analyzePage);
  page.appendChild(container);

  return page;
}
