# KALA SENSE — 3-minute Indie Developer demo

**Entrant:** SANVI TATA MARC ANTOINE · **Track:** Indie Developer · **Format:** solo builder · **Theme:** Build for Your World · **Runtime:** 3:00

## Before recording

- Use one customer-service call you are authorized to process. Do not record a new call for this demo. Do not put the audio file in the repository, commit history, screen recording, or submission attachments.
- Choose a short, de-identified call. Hide names, phone numbers, account numbers, and any other identifying details in the interface and recording. Do not play the audio during screen capture.
- Configure your own `MODEL_API_KEY` locally. Never show the key, API dashboard, or billing details on screen.
- Use a compatible call of at most 10 minutes and 32 MB. For Render Free, open the demo shortly before recording: the service may sleep after 15 idle minutes and take about one minute to wake.
- Confirm the Meta transcription and Muse Spark analysis complete successfully before recording. Keep the actual model result visible; do not edit findings to make them sound stronger.
- If the API or file fails, use the fallback at the end. Do not describe fallback content as a real call or as Meta output.

## Timed script

| Time | On screen | Spoken script |
|---|---|---|
| 0:00–0:20 | KALA SENSE landing screen. Keep the upload panel and Meta Model API label visible. | “I’m Sanvi Tata Marc Antoine, a solo Indie Developer building KALA SENSE in Lomé, Togo. Customer-service supervisors need to find unresolved issues and forgotten commitments in calls without reviewing every minute manually. This project turns one authorized call into evidence-backed review actions.” |
| 0:20–0:45 | Select the authorized, de-identified call. Show its filename only if it contains no identifying information. Click **Transcrire et analyser**. | “I’m using a call I’m authorized to process. The browser converts it locally to the WAV format required by Meta Voice Transcribe. I’m not adding the audio to the public repository; the file is sent to Meta’s API for transcription.” |
| 0:45–1:15 | Show the completed transcript with speaker labels and turn timestamps. Scroll to one relevant turn. | “Muse Voice Transcribe has returned speaker-attributed turns and timestamps. I’ll inspect this point in the actual transcript. The labels identify turns in this call; they do not establish the speakers’ real identities.” |
| 1:15–1:55 | Select one finding. Show its timestamp, evidence quote, rationale, and proposed action. Match the evidence to the visible transcript. | “Muse Spark reviewed the transcript and proposed this finding. Here is the timestamp and the supporting quote. The action is [read the action shown on screen]. The finding is only useful if its evidence matches the conversation, so I compare it with the transcript before making a decision.” |
| 1:55–2:25 | Point out the score and outcome. Click **Valider et préparer les suivis** and show the temporary session list, or click **Rejeter l’analyse**. | “The quality score and outcome are model estimates, not measured business results. I’m the supervisor here: I can accept or reject the analysis. When I validate, the proposed follow-ups appear in this session’s review list. They are temporary and are not saved or sent to an external task system.” |
| 2:25–2:45 | Show the prototype’s limitations note or return to the transcript/results. | “This prototype supports the audio formats shown in the interface and relies on Meta’s supported transcription languages. It does not verify that a procedure was broken, guarantee a resolution, or replace supervisor judgment. Use only calls you have permission to process.” |
| 2:45–3:00 | Show the project title, public repository link, and live demo URL if available. | “This is the KALA SENSE prototype I built during the hackathon. Muse Voice Transcribe handles the audio; Muse Spark produces structured findings and actions. The repository and live demo are here. The next step is to connect approved actions to a real follow-up workflow.” |

## Fallback if the key, API, or audio fails

Switch to **Essayer avec un exemple synthétique** only if the actual call cannot be transcribed or analyzed in time. Keep the on-screen synthetic label visible for the entire fallback and say:

> “The live API call did not complete, so I’m switching to a clearly labeled synthetic example. This is not a real customer call or a result from Meta. It only demonstrates the interface; I’m not claiming a successful transcription or model analysis in this recording.”

Show the transcript and interface briefly, but do not quote its sample findings as evidence or present its score as a measured result. Then state:

> “The live path I intended to demonstrate is Meta Voice Transcribe followed by Muse Spark. That integration still needs a successful run before I can claim it works end to end.”

If time allows, record a new video after the API succeeds rather than submitting a fallback video as proof of live model behavior.

## Final submission checks

- Keep the full video at or under 3:00.
- If using Render Free, wake the service before capture and complete upload, transcription, analysis, and review without a long idle gap.
- Verify the public repository and demo URLs from a signed-out browser.
- Confirm the repository contains no call audio, API key, transcript with personal data, or identifying screenshots.
- Ensure the submission identifies the entrant as one solo Indie Developer and includes only hackathon work being claimed.
- Never state an accuracy, quality improvement, customer outcome, or usage statistic unless it was actually measured and can be substantiated.
