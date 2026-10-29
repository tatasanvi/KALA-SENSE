const $ = (selector) => document.querySelector(selector);
const dropZone = $('#drop-zone');
const fileInput = $('#audio-file');
const notice = $('#notice');
const sampleText = [
  { speaker: 'A', startMs: 0, endMs: 4200, transcript: 'Bonjour, vous êtes bien au service client. Comment puis-je vous aider ?' },
  { speaker: 'B', startMs: 4300, endMs: 10300, transcript: 'Bonjour. J’ai payé ma facture hier, mais ma ligne est toujours suspendue. J’ai besoin de pouvoir travailler.' },
  { speaker: 'A', startMs: 10700, endMs: 16500, transcript: 'Je comprends. Je vois votre paiement, il n’a pas encore été rapproché. Je vais transmettre le dossier à la facturation et demander la réactivation aujourd’hui.' },
  { speaker: 'B', startMs: 16900, endMs: 20500, transcript: 'D’accord, mais comment saurai-je que c’est fait ?' },
  { speaker: 'A', startMs: 20900, endMs: 26300, transcript: 'Vous recevrez un SMS dès que la ligne sera active. Je vérifie aussi votre numéro de contact avant d’envoyer la demande.' },
];
let activeTranscript = '';
let activeTurns = [];
let activeFindings = [];
let sessionFollowups = [];
let currentObjectUrl = null;

function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

function showNotice(message, kind = 'info') {
  notice.className = `notice ${kind}`;
  notice.textContent = message;
  notice.hidden = false;
}

function clearNotice() {
  notice.hidden = true;
  notice.textContent = '';
}

function setBusy(button, message) {
  button.disabled = true;
  button.dataset.label = button.textContent;
  button.innerHTML = `<span class="busy"><span class="spinner"></span>${message}</span>`;
}

function restoreButton(button) {
  button.disabled = false;
  if (button.dataset.label) button.textContent = button.dataset.label;
}

function speakerLabel(speaker) {
  return speaker ? `LOCUTEUR ${speaker}` : 'LOCUTEUR NON ATTRIBUÉ';
}

function renderTranscript(turns, transcript, audioDurationMs) {
  const normalized = turns?.length ? turns : [{ speaker: '', startMs: 0, endMs: audioDurationMs || 0, transcript }];
  $('#transcript-list').replaceChildren(...normalized.map((turn, index) => {
    const row = document.createElement('div');
    row.className = 'transcript-turn';
    row.id = `transcript-turn-${index}`;
    row.tabIndex = -1;
    const time = document.createElement('span');
    time.className = 'turn-time';
    time.textContent = formatDuration((turn.startMs || 0) / 1000);
    const content = document.createElement('div');
    content.className = 'turn-content';
    const speaker = document.createElement('span');
    speaker.className = 'speaker-name';
    speaker.textContent = speakerLabel(turn.speaker);
    content.append(speaker);
    const words = document.createElement('span');
    words.textContent = turn.transcript || '';
    content.append(words);
    row.append(time, content);
    return row;
  }));
}

const types = { commitment: 'Engagement', unresolved: 'À résoudre', procedure: 'Procédure', coaching: 'Coaching' };
const severities = { high: 'Prioritaire', medium: 'À suivre', low: 'Conseil' };

function renderAnalysis(data, source, transcript, turns, audioDurationMs = 0) {
  activeTranscript = transcript;
  activeTurns = turns || [];
  if (!activeTurns.length) activeTurns = [{ speaker: '', startMs: 0, endMs: audioDurationMs || 0, transcript }];
  activeFindings = data.findings || [];
  $('#results-section').hidden = false;
  $('#result-source').textContent = source;
  $('#score-value').textContent = String(data.qualityScore);
  $('#score-track-fill').style.width = `${Math.max(0, Math.min(100, data.qualityScore))}%`;
  const outcome = { resolved: 'Résolu', follow_up: 'Suivi nécessaire', unresolved: 'Non résolu' };
  $('#outcome-value').textContent = outcome[data.customerOutcome] || 'À examiner';
  $('#finding-count').textContent = String(data.findings?.length || 0);
  $('#summary-box').textContent = data.summary;
  renderTranscript(turns, transcript, audioDurationMs);

  const list = $('#findings-list');
  const discardedFindings = Math.max(0, Number.parseInt(data.discardedFindings, 10) || 0);
  let discardedNotice = null;
  if (discardedFindings > 0) {
    discardedNotice = document.createElement('div');
    discardedNotice.className = 'empty-findings';
    discardedNotice.textContent = `${discardedFindings} constat(s) potentiel(s) écarté(s), car la citation était absente ou ne désignait pas un tour unique. Seuls les constats ancrés sont affichés.`;
  }
  if (!data.findings?.length) {
    const empty = document.createElement('div');
    empty.className = 'empty-findings';
    empty.textContent = discardedFindings > 0
      ? 'Aucun constat n’a été retenu avec une preuve unique. Cela ne prouve pas qu’aucun point d’attention n’existe ; vérifie la transcription.'
      : 'Aucun point d’attention n’a été établi dans la transcription. Vérifie cette conclusion avant de clôturer la revue.';
    list.replaceChildren(...(discardedNotice ? [discardedNotice, empty] : [empty]));
  } else {
    const findingCards = data.findings.map((finding) => {
      const article = document.createElement('article');
      article.className = 'finding';
      const head = document.createElement('div');
      head.className = 'finding-head';
      const dot = document.createElement('span');
      dot.className = `severity-dot ${finding.severity || 'medium'}`;
      const kind = document.createElement('span');
      kind.className = 'finding-type';
      kind.textContent = `${types[finding.type] || 'Constat'} · ${severities[finding.severity] || 'À suivre'}`;
      head.append(dot, kind);
      const title = document.createElement('h4');
      title.textContent = finding.title;
      const evidence = document.createElement('p');
      evidence.className = 'evidence';
      const quote = document.createElement('q');
      quote.textContent = finding.evidence;
      const attribution = document.createElement('cite');
      const quoteText = typeof finding.evidence === 'string' ? finding.evidence.trim() : '';
      const exactTurnIndex = activeTurns.findIndex((turn) => typeof turn.transcript === 'string' && quoteText && turn.transcript.includes(quoteText));
      const exactQuoteInTranscript = exactTurnIndex >= 0;
      const evidenceSpeaker = exactTurnIndex >= 0 ? activeTurns[exactTurnIndex].speaker : finding.speaker;
      attribution.textContent = ` — ${speakerLabel(evidenceSpeaker)}`;
      evidence.append(quote, attribution);
      const evidenceLink = document.createElement('button');
      evidenceLink.type = 'button';
      evidenceLink.className = `button button-quiet finding-jump${exactQuoteInTranscript ? '' : ' finding-jump-unverified'}`;
      evidenceLink.style.cssText = 'margin-top:6px;padding:5px 8px;font-size:9px;';
      if (exactQuoteInTranscript) {
        const evidenceTime = exactTurnIndex >= 0 ? activeTurns[exactTurnIndex].startMs : finding.timestampMs;
        evidenceLink.textContent = `Voir le passage à ${formatDuration((evidenceTime || 0) / 1000)}`;
        evidenceLink.setAttribute('aria-label', `Aller à la citation dans la transcription, ${speakerLabel(evidenceSpeaker)}, ${formatDuration((evidenceTime || 0) / 1000)}`);
        evidenceLink.addEventListener('click', () => {
          const target = document.getElementById(`transcript-turn-${exactTurnIndex}`);
          if (!target) return;
          document.querySelectorAll('.transcript-turn.is-highlighted').forEach((turn) => {
            turn.classList.remove('is-highlighted');
            turn.style.outline = '';
            turn.style.backgroundColor = '';
            turn.style.borderRadius = '';
          });
          target.classList.add('is-highlighted');
          target.style.outline = '2px solid #146c55';
          target.style.backgroundColor = '#e9f3ee';
          target.style.borderRadius = '5px';
          target.style.scrollMargin = '80px';
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
          target.focus({ preventScroll: true });
        });
      } else {
        evidenceLink.textContent = 'Citation non retrouvée dans la transcription';
        evidenceLink.disabled = true;
        evidenceLink.title = 'Cette citation ne correspond pas exactement au texte transcrit ; vérifie-la avant de valider.';
      }
      const rationale = document.createElement('p');
      rationale.className = 'finding-rationale';
      rationale.textContent = finding.rationale;
      const action = document.createElement('div');
      action.className = 'finding-action';
      const arrow = document.createElement('span');
      arrow.textContent = '↳';
      const actionText = document.createElement('span');
      actionText.textContent = finding.action;
      action.append(arrow, actionText);
      article.append(head, title, evidence, evidenceLink, rationale, action);
      return article;
    });
    list.replaceChildren(...(discardedNotice ? [discardedNotice, ...findingCards] : findingCards));
  }

  const strengths = $('#strengths');
  const strengthList = $('#strengths-list');
  if (data.strengths?.length) {
    strengths.hidden = false;
    strengthList.replaceChildren(...data.strengths.map((text) => {
      const item = document.createElement('li'); item.textContent = text; return item;
    }));
  } else strengths.hidden = true;
  $('#review-result').hidden = true;
  $('#followup-panel').hidden = sessionFollowups.length === 0;
  $('#review-bar').hidden = false;
  $('#results-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function analyzeTranscript(transcript, turns, source, durationMs = 0, analysisToken = '') {
  showNotice('Muse Spark analyse la transcription et prépare les preuves et les actions.', 'info');
  const result = await fetch('/api/analyze', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ transcript, analysisToken, turns }),
  });
  const data = await result.json();
  if (!result.ok) throw new Error(data.error || 'L’analyse a échoué.');
  clearNotice();
  renderAnalysis(data, source, transcript, turns, durationMs);
}

function sampleAnalysisFallback() {
  return {
    summary: 'Le conseiller a identifié le paiement et promis de demander une réactivation dans la journée. La résolution n’est pas confirmée dans cet échange : un suivi explicite est nécessaire.',
    qualityScore: 76,
    customerOutcome: 'follow_up',
    findings: [
      { type: 'commitment', severity: 'medium', title: 'Demande de réactivation promise aujourd’hui', evidence: 'Je vais transmettre le dossier à la facturation et demander la réactivation aujourd’hui.', speaker: 'A', rationale: 'Un engagement de délai a été formulé. Le résultat de la demande n’apparaît pas dans l’appel.', action: 'Créer une tâche de suivi auprès de la facturation et informer le client après réactivation.', timestampMs: 10700, confidence: 0.96 },
      { type: 'unresolved', severity: 'high', title: 'La ligne reste suspendue à la fin de l’appel', evidence: 'Vous recevrez un SMS dès que la ligne sera active.', speaker: 'A', rationale: 'Le conseiller décrit une étape future ; aucune remise en service n’est confirmée pendant l’échange.', action: 'Vérifier le rapprochement du paiement et confirmer au client le rétablissement de sa ligne.', timestampMs: 20900, confidence: 0.94 },
    ],
    strengths: ['Le conseiller a reconnu l’urgence de la situation.', 'Il a expliqué pourquoi la ligne était encore suspendue.'],
  };
}

async function runSample(button) {
  clearNotice();
  setBusy(button, 'Préparation de l’exemple…');
  activeTranscript = sampleText.map((turn) => turn.transcript).join(' ');
  activeTurns = sampleText;
  try {
    const result = await fetch('/api/analyze', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ transcript: activeTranscript, turns: activeTurns }),
    });
    const data = await result.json();
    if (!result.ok) throw new Error(data.error || 'L’analyse a échoué.');
    clearNotice();
    renderAnalysis(data, 'Exemple synthétique · données fictives', activeTranscript, activeTurns, 26300);
  } catch (error) {
    if (/clé Meta n’est pas configurée/i.test(error.message)) {
      renderAnalysis(sampleAnalysisFallback(), 'Exemple synthétique · résultat illustratif', activeTranscript, activeTurns, 26300);
      showNotice('Exemple synthétique affiché sans appel à Meta. Configure MODEL_API_KEY pour générer les résultats avec Muse Spark.', 'info');
    } else showNotice(error.message, 'error');
  } finally { restoreButton(button); }
}

function validateFile(file) {
  if (!file) return false;
  if (file.size > 32 * 1024 * 1024) { showNotice('Le fichier dépasse la limite de 32 Mo.', 'error'); return false; }
  if (file.size < 128) { showNotice('Ce fichier audio semble trop petit ou illisible.', 'error'); return false; }
  return true;
}

function encodePcmWav(audioBuffer, sampleRate = 24000) {
  const samples = audioBuffer.getChannelData(0);
  const bytesPerSample = 2;
  const dataSize = samples.length * bytesPerSample;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);
  const writeText = (offset, value) => [...value].forEach((char, index) => view.setUint8(offset + index, char.charCodeAt(0)));
  writeText(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeText(8, 'WAVE');
  writeText(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * bytesPerSample, true);
  view.setUint16(32, bytesPerSample, true);
  view.setUint16(34, 16, true);
  writeText(36, 'data');
  view.setUint32(40, dataSize, true);
  let offset = 44;
  for (let index = 0; index < samples.length; index += 1) {
    const sample = Math.max(-1, Math.min(1, samples[index]));
    view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
    offset += 2;
  }
  return new File([buffer], 'kala-appel.wav', { type: 'audio/wav' });
}

async function prepareAudio(file) {
  if (!window.AudioContext && !window.webkitAudioContext) return null;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  const context = new AudioContextClass();
  try {
    const decoded = await context.decodeAudioData(await file.arrayBuffer());
    if (decoded.duration <= 0 || decoded.duration > 600) throw new Error('L’enregistrement doit durer au maximum 10 minutes.');
    const sampleRate = 24000;
    const frameCount = Math.ceil(decoded.duration * sampleRate);
    const OfflineContextClass = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    if (!OfflineContextClass) throw new Error('La conversion audio de ce navigateur n’est pas disponible.');
    const offline = new OfflineContextClass(1, frameCount, sampleRate);
    const source = offline.createBufferSource();
    source.buffer = decoded;
    source.connect(offline.destination);
    source.start(0);
    const mono = await offline.startRendering();
    const wav = encodePcmWav(mono, sampleRate);
    if (wav.size > 32 * 1024 * 1024) throw new Error('Le WAV converti dépasse 32 Mo. Choisis un extrait plus court.');
    return { wav, duration: decoded.duration };
  } catch (error) {
    if (error instanceof Error && ['L’enregistrement', 'La conversion', 'Le WAV'].some((prefix) => error.message.startsWith(prefix))) throw error;
    throw new Error('Le navigateur ne parvient pas à lire ce fichier. Essaie un fichier WAV, MP3 ou M4A standard.');
  }
  finally { await context.close(); }
}

async function processAudio(file) {
  if (!validateFile(file)) return;
  clearNotice();
  $('#results-section').hidden = true;
  const select = $('#selected-file');
  select.hidden = false;
  select.replaceChildren();
  const meta = document.createElement('div');
  meta.className = 'file-meta';
  const fileType = document.createElement('span');
  fileType.className = 'file-type';
  fileType.textContent = file.name.split('.').pop().slice(0, 4).toUpperCase();
  const fileLabel = document.createElement('span');
  fileLabel.textContent = file.name;
  const fileDetail = document.createElement('small');
  fileDetail.textContent = `${(file.size / 1024 / 1024).toFixed(1)} Mo · Conversion en WAV 24 kHz…`;
  fileLabel.append(fileDetail);
  meta.append(fileType, fileLabel);
  select.append(meta);
  let prepared;
  try {
    prepared = await prepareAudio(file);
    if (!prepared) throw new Error('La conversion audio n’est pas disponible dans ce navigateur.');
  } catch (error) {
    showNotice(error.message, 'error');
    return;
  }
  const audio = prepared.wav;
  fileDetail.textContent = `${formatDuration(prepared.duration)} · WAV PCM mono 16 bits · 24 kHz · ${(audio.size / 1024 / 1024).toFixed(1)} Mo`;
  const uploadButton = document.createElement('button');
  uploadButton.type = 'button'; uploadButton.className = 'button button-primary'; uploadButton.textContent = 'Transcrire et analyser';
  select.append(uploadButton);
  let completed = false;
  uploadButton.addEventListener('click', async () => {
    clearNotice(); setBusy(uploadButton, 'Transcription en cours…');
    showNotice('Muse Voice Transcribe traite l’enregistrement, puis Muse Spark l’analyse. Une nouvelle tentative relance des appels Meta et peut consommer des crédits.', 'info');
    let transcriptionReceived = false;
    try {
      const transcriptResponse = await fetch('/api/transcribe', {
        method: 'POST', headers: {
          'content-type': 'audio/wav',
          'x-audio-name': encodeURIComponent(file.name.replace(/\.[^.]+$/, '.wav')),
          'x-language-bias': $('#language-bias').value,
        }, body: audio,
      });
      const transcription = await transcriptResponse.json();
      if (!transcriptResponse.ok) throw new Error(transcription.error || 'La transcription a échoué.');
      if (!transcription.transcript) throw new Error('Meta n’a renvoyé aucun texte transcrit.');
      transcriptionReceived = true;
      activeTranscript = transcription.transcript;
      activeTurns = transcription.turns || [];
      await analyzeTranscript(activeTranscript, activeTurns, 'Transcription Meta · Muse Voice Transcribe', transcription.audioDurationMs || 0, transcription.analysisToken);
      completed = true;
    } catch (error) {
      showNotice(`${error.message} Tu peux réessayer avec ce même fichier ; cela relance la transcription et peut consommer des crédits Meta.`, 'error');
      uploadButton.dataset.label = transcriptionReceived
        ? 'Réessayer · nouvel appel Meta'
        : 'Réessayer la transcription';
    } finally {
      if (completed) {
        uploadButton.disabled = true;
        uploadButton.textContent = 'Analyse terminée';
      } else restoreButton(uploadButton);
    }
  });
}

$('#browse-button').addEventListener('click', (event) => { event.stopPropagation(); fileInput.click(); });
dropZone.addEventListener('click', () => fileInput.click());
dropZone.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); fileInput.click(); } });
fileInput.addEventListener('change', () => {
  const file = fileInput.files?.[0];
  fileInput.value = '';
  if (file) processAudio(file);
});
dropZone.addEventListener('dragover', (event) => { event.preventDefault(); dropZone.classList.add('dragging'); });
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragging'));
dropZone.addEventListener('drop', (event) => { event.preventDefault(); dropZone.classList.remove('dragging'); processAudio(event.dataTransfer.files?.[0]); });
$('#sample-button').addEventListener('click', (event) => runSample(event.currentTarget));
$('#copy-button').addEventListener('click', async () => {
  if (!activeTranscript) return;
  try { await navigator.clipboard.writeText(activeTranscript); showNotice('Transcription copiée dans le presse-papiers.', 'success'); }
  catch { showNotice('Impossible d’accéder au presse-papiers dans ce contexte.', 'error'); }
});
async function refreshHistory() {
  const panel = $('#history-panel');
  const listEl = $('#history-list');
  if (!panel || !listEl) return;
  try {
    const result = await fetch('/api/analyses');
    const data = await result.json().catch(() => ({}));
    if (!result.ok) throw new Error(data.error || 'Historique indisponible.');
    const items = Array.isArray(data.items) ? data.items : [];
    if (!items.length) {
      panel.hidden = false;
      listEl.replaceChildren(Object.assign(document.createElement('li'), { textContent: 'Aucune analyse sauvegardée pour le moment.' }));
      return;
    }
    panel.hidden = false;
    listEl.replaceChildren(...items.map((item) => {
      const row = document.createElement('li');
      const date = item.createdAt ? new Date(item.createdAt).toLocaleString('fr-FR') : 'date inconnue';
      const score = item.qualityScore ?? '—';
      row.textContent = `${date} · score ${score} · ${item.findingCount} constat(s) — ${(item.summary || '').slice(0, 120)}`;
      return row;
    }));
  } catch (error) {
    panel.hidden = false;
    listEl.replaceChildren(Object.assign(document.createElement('li'), { textContent: `Historique indisponible : ${error.message}` }));
  }
}

$('#approve-button').addEventListener('click', () => {
  $('#review-bar').hidden = true;
  const result = $('#review-result'); result.hidden = false;
  const actions = activeFindings.map((finding) => finding.action).filter(Boolean);
  sessionFollowups.push(...actions);
  result.textContent = actions.length
    ? `Analyse validée. ${actions.length} suivi(s) ajouté(s) à la liste temporaire de cette session. Rien n’est sauvegardé.`
    : 'Analyse validée. Aucun suivi n’a été proposé. Décision temporaire, non sauvegardée.';
  const followupPanel = $('#followup-panel');
  const followupList = $('#followup-list');
  if (sessionFollowups.length) {
    followupPanel.hidden = false;
    followupList.replaceChildren(...sessionFollowups.map((task, index) => {
      const item = document.createElement('li');
      const number = document.createElement('span');
      number.className = 'followup-number';
      number.textContent = String(index + 1).padStart(2, '0');
      const text = document.createElement('span');
      text.textContent = task;
      item.append(number, text);
      item.style.cssText = 'display:flex;gap:10px;align-items:flex-start;padding:10px 0;border-bottom:1px solid #edf0ed;font-size:11px;line-height:1.5;list-style:none;';
      number.style.cssText = 'color:#146c55;font-size:9px;font-weight:700;';
      return item;
    }));
  }
});
$('#reject-button').addEventListener('click', () => {
  $('#review-bar').hidden = true;
  const result = $('#review-result'); result.hidden = false;
  result.textContent = 'Analyse rejetée dans cette session. Aucun suivi n’a été ajouté ; cette décision n’est pas sauvegardée.';
});

if (currentObjectUrl) URL.revokeObjectURL(currentObjectUrl);

refreshHistory();
