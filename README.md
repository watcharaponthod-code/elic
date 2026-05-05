# ELIC — English Language Improvement Chatbot

> An AI-powered mobile application for conversational English learning, built on React Native and Google Gemini.

[![React Native](https://img.shields.io/badge/React%20Native-0.76.9-61dafb?logo=react)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-~52.0-000020?logo=expo)](https://expo.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-9.23.0-ffca28?logo=firebase)](https://firebase.google.com/)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-AI-4285f4?logo=google)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## Overview

ELIC is a mobile English learning application that places users inside realistic conversational scenarios — a hotel check-in, a job interview, a visit to the doctor — and guides them through each interaction with a role-aware AI tutor powered by Google Gemini. Every response from the AI is structured to deliver not just a reply, but also vocabulary breakdowns and real-time spelling and grammar corrections, making each conversation a complete learning session.

The application is designed for Thai-speaking learners who need practical, context-driven English practice rather than rote memorization. It combines a conversational AI core with gamified exercises, leaderboards, and text-to-speech playback to reinforce both reading and listening skills.

---

## Demo

[![Watch on YouTube](https://img.youtube.com/vi/PKXDnShNFuY/maxresdefault.jpg)](https://youtu.be/PKXDnShNFuY?si=1Jyjcs10awJH5j58)

---

## Key Features

### Scenario-Based AI Conversation
Users select a conversation role before entering the chat. The role determines a tailored system prompt injected into every Gemini API request, ensuring the AI behaves as a domain-appropriate English tutor throughout the session.

Available roles:
- Hotel check-in and guest services
- Restaurant ordering and dining
- Job interview preparation
- Medical consultation
- Meeting a new acquaintance
- Taxi and transportation

### Structured AI Response Parsing
Every response from Gemini is parsed into three distinct components rendered independently in the UI:
1. **Conversation reply** — the natural language response in the selected scenario
2. **Vocabulary table** — a formatted English/Thai/example breakdown of key terms from the exchange
3. **Spelling and grammar correction** — highlights user errors with corrected alternatives and better phrasing suggestions

### Text-to-Speech Playback
AI responses can be read aloud via two available TTS pathways:
- `expo-speech` for immediate on-device playback
- A Python-based TTS server (`api/tts_server.py`) backed by Gemini's voice API for higher-quality audio output with configurable voice names

### English Learning Games
Three interactive games reinforce vocabulary and translation skills outside the chat context:

| Game | Description |
|---|---|
| Word Game | Given a random letter, the user must submit a valid English word beginning with that letter. Gemini validates each submission. |
| Translation Game | A Thai sentence is displayed at a chosen difficulty level. The user translates it into English and Gemini scores the accuracy. |
| Match | A matching exercise pairing English and Thai vocabulary. |

All game scores are persisted to Firebase Realtime Database and aggregated on a live Scoreboard and Rank screen.

### Authentication and Offline Support
Authentication is handled through Firebase Auth with email and password. User sessions are cached to AsyncStorage, allowing the application to load the last authenticated state without a network round-trip.

---

## Architecture

![ELIC Architecture](./architecture-diagram.svg)

The system is composed of three principal layers.

### Client Layer (React Native / Expo)
The mobile application is built with React Native and bundled through Expo. Navigation is managed by React Navigation with a stack-based structure across thirteen screens. UI state, animation, and component lifecycle are managed entirely within React functional components using hooks.

### Backend and Data Layer (Firebase)
| Service | Purpose |
|---|---|
| Firebase Authentication | User registration, login, password recovery |
| Cloud Firestore | User profile documents |
| Firebase Realtime Database | Game scores, leaderboards, play history |
| AsyncStorage | Local session cache for offline startup |

### AI and Service Layer
| Service | Role |
|---|---|
| Google Gemini API | Conversational AI, response generation, translation scoring, word validation |
| Python TTS Server (FastAPI) | High-quality text-to-speech using Gemini voice API |
| Python Speech Server (Flask) | Alternative speech bridge via `av.py` |

---

## LLM Workflow

The following describes the complete data flow for a single chat interaction.

```
User selects role
        |
        v
getRolePrompt.js generates system prompt
(e.g. "You are an English teacher in a hotel setting...")
        |
        v
User types a message
        |
        v
ChatScreen assembles API payload:
  - system prompt (role-based)
  - conversation history (prior turns)
  - user message
        |
        v
POST --> Google Gemini API
(generativelanguage.googleapis.com)
        |
        v
Gemini returns structured response:
  {
    reply: "...",
    vocabulary: [{ english, thai, example }],
    spellingCorrection: { original, corrected, betterPhrase, errors[] }
  }
        |
        v
ChatScreen renders:
  - Chat bubble (reply text)
  - VocabularyTable component
  - SpellingCorrection component
        |
        v
[Optional] User taps speak button
        |
        v
expo-speech  OR  POST --> TTS Server --> WAV audio
```

---

## Project Structure

```
elic/
├── App.js                        # Root navigator and auth state listener
├── app.json                      # Expo configuration
├── config/
│   └── firebase.js               # Firebase initialization
├── screens/
│   ├── ChatScreen.js             # Primary AI chat interface
│   ├── LoginScreen.js / LoginApp.js / SignUpApp.js / ForgotPassword.js
│   ├── menu.js                   # Main menu navigation
│   ├── profile.js                # User profile screen
│   ├── option/
│   │   ├── Settings.js           # Role selector component
│   │   ├── getRolePrompt.js      # Role-to-system-prompt mapping
│   │   ├── MiniMenu.js
│   │   ├── random.js / random1.js  # Sentence pools for Translation game
│   └── game/
│       ├── WordGame.js           # Random letter word challenge
│       ├── Translation.js        # Thai-to-English translation game
│       ├── Match.js              # Vocabulary matching game
│       ├── Rank.js               # Personal rank display
│       └── Scoreboard.js         # Live leaderboard
├── components/
│   └── QuickMessageOptions.js    # Preset message shortcuts
├── api/
│   ├── speech_server.py          # Flask TTS bridge (port 5000)
│   └── tts_server.py             # FastAPI TTS server (port 8000)
└── assets/                       # Fonts, images, audio files
```

---

## Getting Started

### Prerequisites

- Node.js 20 or later
- Expo CLI
- Android Studio or a physical Android device
- A Google Gemini API key
- A Firebase project with Authentication, Firestore, and Realtime Database enabled

### Installation

```bash
git clone https://github.com/watcharaponthod-code/elic.git
cd elic
npm install
```

### Environment Configuration

Create `config/.env` and set the required keys:

```env
GEMINI_API_KEY=your_gemini_api_key
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
```

### Running the Application

```bash
npx expo start
```

Scan the QR code with Expo Go, or press `a` to launch on a connected Android device or emulator.

### Running the TTS Server (Optional)

```bash
pip install fastapi uvicorn flask flask-cors
python api/tts_server.py
```

---

## Building a Release APK

This repository includes a GitHub Actions workflow that builds the APK through EAS and uploads it to Google Drive automatically.

1. Trigger the workflow from the **Actions** tab in GitHub
2. Select build profile: `preview` or `production`
3. The **Build APK with EAS** job compiles the application on Expo's build infrastructure
4. The **Upload to Google Drive** job waits for the build to complete, downloads the APK, and uploads it to the shared Drive folder

Requires the following repository secrets: `EXPO_TOKEN`, `MATON_API_KEY`

Pre-built APK download: [Google Drive](https://drive.google.com/drive/folders/1_733nt1TTmaK9fqcgd-cGJRLJuieBpj5)

---

## Use Case Diagram — LLM Workflow Prompt

The following prompt can be submitted to any LLM or diagram tool (PlantUML, Mermaid Live, ChatGPT, etc.) to generate a use case diagram of the ELIC LLM workflow.

```
Generate a formal UML Use Case Diagram for a mobile English learning application called ELIC.

Actors:
- User (primary actor, authenticated Thai-speaking learner)
- Google Gemini API (external AI system)
- Firebase (external data system)
- TTS Service (external audio system)

Use Cases grouped by subsystem:

[Authentication]
- Register with email and password
- Log in to account
- Reset forgotten password
- Maintain offline session via local cache

[AI Chat Module]
- Select conversation role (hotel / restaurant / interview / doctor / new friend / taxi)
- Send message to AI tutor
  -- include: Generate role-based system prompt
  -- include: Attach conversation history
- Receive structured AI response
  -- include: Parse vocabulary table
  -- include: Parse spelling and grammar correction
- Play AI response as audio
  -- extend: Use device TTS (expo-speech)
  -- extend: Use Python TTS server (Gemini voice API)

[Game Module]
- Play Word Game (validate English word via Gemini)
- Play Translation Game (score Thai-to-English translation via Gemini)
- Play Match Game
- View personal rank
- View live scoreboard

[Profile]
- View user profile
- Configure chatbot role in settings

Relationships:
- "Send message to AI tutor" communicates with Google Gemini API
- "Play Word Game" and "Play Translation Game" communicate with Google Gemini API
- All authentication and score storage use cases communicate with Firebase
- "Play AI response as audio" communicates with TTS Service

Style: Use standard UML Use Case notation with system boundary box labeled "ELIC Mobile Application". Place external actors outside the boundary. Show include and extend relationships with dashed arrows labeled <<include>> and <<extend>>.
```

---

## Technology Stack

| Category | Technology |
|---|---|
| Mobile Framework | React Native 0.76.9, Expo ~52.0 |
| Navigation | React Navigation 7 |
| AI | Google Gemini API (gemini-2.0-flash) |
| Authentication | Firebase Authentication |
| Database | Firebase Firestore, Firebase Realtime Database |
| Local Storage | AsyncStorage |
| TTS | expo-speech, FastAPI + Gemini Voice |
| Build | EAS Build (Expo Application Services) |
| CI/CD | GitHub Actions |

---

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

## Download

Pre-built APK: [Google Drive Folder](https://drive.google.com/drive/folders/1_733nt1TTmaK9fqcgd-cGJRLJuieBpj5)

For installation instructions, see [DOWNLOAD.md](DOWNLOAD.md).
