# KALA SENSE — Hackathon prototype

KALA SENSE turns a customer-service conversation into a transcript, evidence-backed quality findings, and human-reviewed follow-up actions.

**Hackathon entry:** Indie Developer · solo contributor: **SANVI TATA MARC ANTOINE**.

## What this prototype does

- Transcribes a WAV call with Meta Muse Voice Transcribe, including speaker labels and turn-level timestamps.
- Reviews the transcript with Meta Muse Spark and returns a structured, evidence-based quality summary.
- Lets a supervisor approve or reject the analysis in the interface.
- Includes one clearly labeled synthetic transcript for a UI walkthrough. Its illustrative result is not a measured call or a real performance statistic.

KALA SENSE does not write uploaded audio to disk. The browser sends the normalized audio to the KALA Node server, which forwards it to Meta Model API for transcription. To connect the transcript to its analysis, the server temporarily holds the transcript and speaker turns in memory for up to 15 minutes; it deletes them when analysis starts. Each transcription receives a random, one-use opaque analysis token so the server can bind that request to the same in-memory transcript. The transcript and turns are then sent to Meta Model API for Muse Spark analysis. Analysis results are returned to the browser and are not persisted. Use only recordings you have permission to process.

## Requirements

- Node.js 22.22.x (the deployment configuration pins this major/minor line)
- A Meta Model API key with available credits
- Audio formats readable by the browser (such as WAV, MP3, M4A, OGG, or WebM); maximum 10 minutes and 32 MB

The browser converts accepted recordings locally to mono, 16-bit PCM WAV at 24 kHz before sending the converted file to the Meta transcription endpoint. The Meta endpoint accepts RIFF/WAVE PCM at 16 or 24 kHz, mono, 16-bit, and limits recordings to 10 minutes and requests to 32 MB. French is the default language hint. Ewe is not listed among Meta Voice Transcribe's documented supported languages, so this prototype does not claim Ewe transcription support.

## Run locally

1. Copy `.env.example` to `.env` and set `MODEL_API_KEY` to your own key.
2. In PowerShell, set the environment variable for the current session:

   ```powershell
   $env:MODEL_API_KEY = "your-key"
   npm run dev
   ```

3. Open `http://localhost:3000`.

No API key is needed to view the interface or see the labeled synthetic example. Muse Spark analysis and real audio transcription require a key.

## Meta models used

- `muse-voice-transcribe-1.0` at `https://api.meta.ai/v1/asr/transcribe` for WAV transcription and diarization.
- `muse-spark-1.3` at `https://api.meta.ai/v1/chat/completions` for structured quality review.

The API key is read only by the Node server from `MODEL_API_KEY`; it is never sent to the browser. Model outputs are suggestions, not verified facts. Supervisors must review every conclusion.

## Public demo safeguards

The server applies per-process hourly caps of 10 transcription calls and 20 analysis calls to limit unintended use of the participant's credits. The cap resets with the hourly window and may reset if the free hosting process restarts. A Render Free service can sleep after 15 minutes without inbound traffic; wake it before a live demo. The waiting transcript is held in memory, so finish transcription and analysis in one continuous flow.

The included `render.yaml` describes a Render Free Node web service. Free instances have 0.1 CPU and 512 MB RAM, receive 750 instance-hours per workspace per calendar month, and may restart. A service idle for 15 minutes spins down; waking it can take about one minute. Its filesystem is ephemeral, and this prototype keeps a pending transcript in process memory, so a restart or sleep can lose it. Keep upload → transcription → analysis in one continuous session, and open the demo shortly before presenting it. Free service hours, outbound bandwidth, and build pipeline usage are workspace-level limits; an exhausted hour allowance suspends Free services for the rest of that month. Render describes Free instances as suitable for preview and testing, not production.

On the initial Render Blueprint creation, enter `MODEL_API_KEY` when prompted. The Blueprint keeps it out of source control with `sync: false`; later Blueprint syncs do not prompt again, so add or rotate the key in the Render service settings when needed. Do not commit the key or put it in the browser bundle.

Render references: [Free instances](https://render.com/docs/free), [compute plans](https://render.com/docs/compute-plans), [Blueprint secret variables](https://render.com/docs/blueprint-spec#prompting-for-secret-values).

## Hackathon work boundary

This repository contains the new hackathon prototype. If an earlier KALA SENSE dashboard exists elsewhere, it is not imported here and should not be included in the submission demo unless its pre-hackathon origin is clearly disclosed and only hackathon-built changes are shown.
