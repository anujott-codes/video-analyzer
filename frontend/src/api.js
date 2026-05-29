/* ═══════════════════════════════════════════════════════════
   VidMind — API Client
   Fetch wrappers for all FastAPI backend endpoints
   ═══════════════════════════════════════════════════════════ */

const BASE = '/api';

/**
 * POST /transcribe — multipart form (file or youtube_url)
 * @param {FormData} formData
 * @returns {Promise<{transcript: string, num_chunks: number, source_type: string}>}
 */
export async function transcribe(formData) {
  const res = await fetch(`${BASE}/transcribe`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Transcription failed');
  }
  return res.json();
}

/**
 * POST /summary — JSON body
 * @param {string} transcript
 * @returns {Promise<{title: string, summary: string}>}
 */
export async function summarize(transcript) {
  const res = await fetch(`${BASE}/summary`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transcript }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Summarization failed');
  }
  return res.json();
}

/**
 * POST /extract — JSON body
 * @param {string} transcript
 * @returns {Promise<{action_items: string, decisions: string, questions: string}>}
 */
export async function extract(transcript) {
  const res = await fetch(`${BASE}/extract`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transcript }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Extraction failed');
  }
  return res.json();
}

/**
 * POST /chat — JSON body
 * @param {string} question
 * @returns {Promise<{answer: string}>}
 */
export async function chat(question) {
  const res = await fetch(`${BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Chat query failed');
  }
  return res.json();
}

/**
 * GET /health
 * @returns {Promise<{status: string}>}
 */
export async function healthCheck() {
  const res = await fetch(`${BASE}/health`);
  return res.json();
}
