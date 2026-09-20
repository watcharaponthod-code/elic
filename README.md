<div align="center">

# ELIC

**English Language Improvement Chatbot**

A Thai-first mobile app that teaches spoken English through role-played conversation,
built on React Native and a Thai-tuned LLM.

[![React Native](https://img.shields.io/badge/React%20Native-0.76.9-61dafb?logo=react)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-SDK%2052-000020?logo=expo)](https://expo.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-9.23-ffca28?logo=firebase)](https://firebase.google.com/)
[![Typhoon](https://img.shields.io/badge/LLM-Typhoon%20ThaiLLM%208B-6e56cf)](https://thaillm.or.th/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

[Download APK](#download) · [Architecture](#architecture) · [Timeline](#timeline)

</div>

---

## Why this exists

Thai learners are rarely short on English vocabulary. They are short on **situations** —
the hotel front desk, the job interview, the doctor's office — where the words have to come
out in real time, under pressure, in the right register.

ELIC builds those situations. You pick a scenario, and an AI tutor stays in that role for
the whole conversation: correcting your grammar mid-sentence, pulling out the vocabulary you
actually needed, and reading its replies aloud so you hear the rhythm.

Started **August 2024**, when conversational LLMs were new enough that "put a language tutor
inside a phone app" was still an open engineering question rather than a template. The prompt
structure, the structured-output parsing, and the context pruning in this repo were all worked
out by trial against a live model — there was no framework to copy.

---

## Features

### Role-played conversation

Six scenarios, each with its own tutor persona injected as a system prompt on every turn:

| Scenario | What you practice |
|---|---|
| Hotel | Check-in, room requests, hotel services |
| Restaurant | Ordering, preferences, recommendations |
| Job interview | Self-introduction, experience, job fit |
| Doctor | Describing symptoms, understanding medical terms |
| New friend | Small talk, hobbies, personal interests |
| Taxi | Directions, locations, travel small talk |

Difficulty is a separate axis, so the same scenario runs easy or hard.

### One reply, three learning artifacts

The tutor does not return prose. It returns JSON, and the app renders each piece as its own
UI component:

```json
{
  "type": "correction",
  "message": "Of course! Which room type would you prefer?",
  "corrections": {
    "errors": [
      {
        "original": "I want book a room",
        "corrected": "I want to book a room",
        "explanation": "need 'to' after want"
      }
    ]
  }
}
```

- **Chat bubble** — the in-character reply
- **`SpellingCorrection`** — your errors, corrected, explained in Thai and English
- **`VocabularyTable`** — English / Thai / example sentence, triggered when you ask for
  vocabulary in either language

Model output is never assumed to be clean JSON. The parser strips code fences, slices from
the first `{` to the last `}`, and falls back to rendering the raw text as a plain message if
parsing still fails — a malformed response degrades into a normal chat turn instead of an
error screen.

### Conversation memory that does not blow up

Long sessions lose the thread and cost tokens. ELIC handles both:

- Only the **last 8 turns** are sent as context on any request
- A session is flagged long past **40 messages or ~6,000 characters**
- Beyond that, history is pruned by **importance score** — message length, presence of a
  question mark, and extracted topic keywords — keeping the most recent 75% intact and
  salvaging the highest-scoring older turns

The conversation stays coherent for an hour without a growing payload.

### Text to speech

Three paths, so the app still speaks when no server is running:

- `expo-speech` — on-device, instant, always available
- **FastAPI server** (`api/tts_server.py`) — Gemini Live voice API for natural audio
- **Flask bridge** (`api/speech_server.py`) — alternative route through `av.py`

### Games and leaderboard

| Game | Mechanic |
|---|---|
| **Word Game** | A random letter appears; submit a real English word starting with it. Validated by the model, with a used-word list so you cannot repeat. |
| **Translation** | A Thai sentence from a curated bank (7 categories × 2 difficulties) — translate it, and the model scores the attempt. |
| **Match** | 60-second timed English↔Thai card matching over a **1,400+ word** hand-built vocabulary bank. |
| **Rank / Scoreboard** | Live leaderboard and personal play history, written to Firebase Realtime Database. |

### Auth with offline start

Firebase Auth (email/password + Google Sign-In) with the session mirrored into AsyncStorage.
The app renders the last authenticated state immediately on cold start and reconciles with
Firebase in the background — no spinner waiting on the network.

---

## Architecture

![ELIC Architecture](./architecture-diagram.svg)

```
┌──────────────────────────────────────────────┐
│  React Native / Expo  ·  13 screens          │
│  React Navigation (stack)                    │
└───────┬─────────────────┬──────────────┬─────┘
        │                 │              │
        ▼                 ▼              ▼
┌───────────────┐  ┌─────────────┐  ┌──────────────┐
│ Typhoon       │  │  Firebase   │  │ TTS servers  │
│ ThaiLLM 8B    │  │  Auth       │  │ FastAPI :8000│
│ — chat tutor  │  │  Firestore  │  │ Flask   :5000│
│               │  │  RTDB       │  │              │
│ Gemini 2.0    │  │  — scores   │  │ expo-speech  │
│ — games, TTS  │  │  — ranks    │  │ — fallback   │
└───────────────┘  └─────────────┘  └──────────────┘
```

**Two models, on purpose.** The chat tutor runs on `typhoon-s-thaillm-8b-instruct` via
ThaiLLM — a Thai-tuned model that writes Thai-language grammar explanations far better than a
general model. The games run on `gemini-2.0-flash`, where the task is short English word and
translation validation, and latency matters more than Thai fluency. The chat path was migrated
off Gemini in May 2026 for exactly this reason.

### One chat turn, end to end

```
role selection ──► getRolePrompt()   ──┐
last 8 turns   ──► formatChatHistory ──┤
user message   ───────────────────────►├──► POST thaillm.or.th/v1/chat/completions
difficulty     ───────────────────────►│    temperature 0.5 · max_tokens 1024
output schema  ───────────────────────►┘
                                        │
                                        ▼
                         tolerant JSON extraction
                                        │
                   ┌────────────────────┼────────────────────┐
                   ▼                    ▼                    ▼
             chat bubble        SpellingCorrection    VocabularyTable
                   │
                   └──► [speak] ──► expo-speech  or  TTS server ──► WAV
```

---

## Project structure

```
elic/
├── App.js                      Root navigator + auth state listener
├── config/firebase.js          Firebase initialization
├── screens/
│   ├── ChatScreen.js           Chat UI, prompt assembly, response parsing (~1,950 lines)
│   ├── LoginScreen.js  LoginApp.js  SignUpApp.js  ForgotPassword.js
│   ├── menu.js  profile.js
│   ├── option/
│   │   ├── getRolePrompt.js    Scenario → system prompt
│   │   ├── Settings.js         Role + difficulty selector
│   │   ├── random.js           1,400+ word EN/TH vocabulary bank
│   │   └── random1.js          Thai sentence bank, 7 categories × 2 levels
│   └── game/
│       ├── WordGame.js  Translation.js  Match.js
│       └── Rank.js  Scoreboard.js
├── components/QuickMessageOptions.js
├── api/
│   ├── tts_server.py           FastAPI + Gemini Live voice  (:8000)
│   └── speech_server.py        Flask bridge via av.py       (:5000)
└── .github/workflows/build-apk.yml   EAS build → Google Drive upload
```

---

## Getting started

**Prerequisites** — Node.js 20+, Expo CLI, Android Studio or a physical device, a Firebase
project (Auth + Firestore + Realtime Database), a ThaiLLM API key, a Google Gemini API key.

```bash
git clone https://github.com/watcharaponthod-code/elic.git
cd elic
npm install
npx expo start
```

Press `a` for Android, or scan the QR code with Expo Go.

### Configuration

Create `config/.env`. It is gitignored — no key belongs in source:

```env
THAILLM_API_KEY=...
GEMINI_API_KEY=...
FIREBASE_API_KEY=...
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=...
FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
FIREBASE_STORAGE_BUCKET=...
FIREBASE_MESSAGING_SENDER_ID=...
FIREBASE_APP_ID=...
```

### Optional: run the TTS server

```bash
pip install fastapi uvicorn google-generativeai python-multipart
python api/tts_server.py
```

---

## Building a release APK

`.github/workflows/build-apk.yml` runs the whole release on GitHub Actions:

1. Trigger **Build APK with EAS** from the Actions tab, choosing `preview` or `production`
2. EAS compiles on Expo's infrastructure and returns a `build_id`
3. A second job polls that specific build, downloads the APK, and uploads it to Google Drive

Required repository secrets: `EXPO_TOKEN`, `MATON_API_KEY`.
Full walkthrough in [HOW-TO-BUILD.md](HOW-TO-BUILD.md).

---

## Download

Pre-built APK: **[Google Drive](https://drive.google.com/drive/folders/1_733nt1TTmaK9fqcgd-cGJRLJuieBpj5)**
· Install instructions in [DOWNLOAD.md](DOWNLOAD.md)

---

## Timeline

| | |
|---|---|
| **Aug 2024** | First commit — chat prototype against an early conversational LLM |
| **Mar – Jun 2025** | Games, Firebase leaderboards, profile, TTS servers |
| **Oct 2025** | UI rework |
| **May 2026** | Chat migrated to Typhoon ThaiLLM 8B · Google Sign-In · EAS + GitHub Actions release pipeline |

48 commits · ~14,600 lines of application code.

---

## Tech stack

| | |
|---|---|
| Mobile | React Native 0.76.9, Expo SDK 52 |
| Navigation | React Navigation 6 (stack) |
| Chat LLM | Typhoon `typhoon-s-thaillm-8b-instruct` (ThaiLLM) |
| Game LLM | Google `gemini-2.0-flash` |
| Auth | Firebase Authentication + Google Sign-In |
| Data | Cloud Firestore, Realtime Database, AsyncStorage |
| TTS | expo-speech · FastAPI + Gemini Live voice · Flask |
| Build | EAS Build, GitHub Actions |

---

## License

MIT — see [LICENSE](LICENSE).
