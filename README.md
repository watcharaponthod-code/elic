<div align="center">

# ELIC

**English Language Improvement Chatbot**

แอปฝึกพูดภาษาอังกฤษบนมือถือสำหรับคนไทย สอนผ่านการสวมบทบาทสถานการณ์จริง
สร้างด้วย React Native และ LLM ที่ปรับมาสำหรับภาษาไทย

[![React Native](https://img.shields.io/badge/React%20Native-0.76.9-61dafb?logo=react)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-SDK%2052-000020?logo=expo)](https://expo.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-9.23-ffca28?logo=firebase)](https://firebase.google.com/)
[![Typhoon](https://img.shields.io/badge/LLM-Typhoon%20ThaiLLM%208B-6e56cf)](https://thaillm.or.th/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

[ดาวน์โหลด APK](#ดาวน์โหลด) · [สถาปัตยกรรม](#สถาปัตยกรรม) · [ไทม์ไลน์](#ไทม์ไลน์)

</div>

---

## ทำไมถึงทำแอปนี้

คนไทยส่วนใหญ่ไม่ได้ขาดคำศัพท์ แต่ขาด **สถานการณ์** ที่ต้องพูดออกมาจริง ๆ
เคาน์เตอร์โรงแรม ห้องสัมภาษณ์งาน ห้องตรวจของหมอ ที่ซึ่งต้องนึกคำให้ทันและเลือกระดับภาษาให้ถูก

ELIC สร้างสถานการณ์พวกนั้นขึ้นมา ผู้ใช้เลือกฉากที่อยากฝึก แล้ว AI จะอยู่ในบทบาทนั้นตลอดบทสนทนา
คอยแก้ไวยากรณ์ให้กลางประโยค ดึงคำศัพท์ที่เพิ่งได้ใช้ออกมาให้ดู และอ่านออกเสียงให้ฟังจังหวะ

โปรเจ็คนี้เริ่มเมื่อ **สิงหาคม 2024** ตอนที่ LLM แบบสนทนายังใหม่พอที่การ "เอาครูสอนภาษาใส่ในแอปมือถือ"
ยังเป็นโจทย์วิศวกรรมที่ยังไม่มีใครตอบ โครงสร้าง prompt การ parse output ที่เป็นโครงสร้าง
และวิธีตัดบริบทในโค้ดนี้ ล้วนได้มาจากการลองกับโมเดลจริงซ้ำ ๆ ไม่ได้ลอกมาจาก framework ไหน

---

## ความสามารถ

### บทสนทนาแบบสวมบทบาท

หกสถานการณ์ แต่ละอันมี persona ของตัวเอง ฉีดเข้าไปเป็น system prompt ทุกครั้งที่คุย

| สถานการณ์ | ได้ฝึกอะไร |
|---|---|
| โรงแรม | เช็คอิน ขอห้อง ขอบริการต่าง ๆ |
| ร้านอาหาร | สั่งอาหาร บอกความชอบ ขอคำแนะนำ |
| สัมภาษณ์งาน | แนะนำตัว เล่าประสบการณ์ ตอบว่าทำไมเหมาะกับงาน |
| หาหมอ | บอกอาการ เข้าใจศัพท์การแพทย์ |
| เพื่อนใหม่ | คุยเล่น งานอดิเรก ความสนใจส่วนตัว |
| แท็กซี่ | บอกทาง ถามสถานที่ คุยเล่นระหว่างทาง |

ระดับความยากเป็นอีกแกนหนึ่ง ฉากเดิมจึงเล่นได้ทั้งแบบง่ายและแบบยาก

### หนึ่งคำตอบ ได้สามอย่าง

AI ไม่ได้ตอบมาเป็นข้อความเปล่า ๆ แต่ตอบเป็น JSON แล้วแอปแยกไปวาดเป็นคนละ component

```json
{
  "type": "correction",
  "message": "Of course! Which room type would you prefer?",
  "corrections": {
    "errors": [
      {
        "original": "I want book a room",
        "corrected": "I want to book a room",
        "explanation": "ต้องมี to หลัง want"
      }
    ]
  }
}
```

- **กล่องแชต** คำตอบในบทบาทนั้น
- **`SpellingCorrection`** จุดที่ผิด พร้อมคำที่ถูกและคำอธิบายทั้งไทยและอังกฤษ
- **`VocabularyTable`** อังกฤษ / ไทย / ประโยคตัวอย่าง จะขึ้นเมื่อผู้ใช้ขอคำศัพท์ ไม่ว่าจะพิมพ์ภาษาไหน

โค้ดไม่เคยเชื่อว่าโมเดลจะส่ง JSON ที่สะอาดกลับมา ตัว parser จะลอก code fence ออก
ตัดเอาเฉพาะช่วงตั้งแต่ `{` ตัวแรกถึง `}` ตัวสุดท้าย และถ้ายัง parse ไม่ผ่าน
จะถอยไปแสดงเป็นข้อความธรรมดาแทน คำตอบที่พังจึงกลายเป็นแชตปกติ ไม่ใช่หน้าจอ error

### ความจำบทสนทนาที่ไม่บานปลาย

คุยนานแล้วโมเดลหลุดบริบทและเปลืองโทเค็น ELIC จัดการทั้งสองเรื่อง

- ส่งไปแค่ **8 เทิร์นล่าสุด** เป็นบริบทในแต่ละครั้ง
- ถือว่าบทสนทนายาวเมื่อเกิน **40 ข้อความ หรือราว 6,000 ตัวอักษร**
- เกินจากนั้นจะตัดทิ้งตาม **คะแนนความสำคัญ** ซึ่งคิดจากความยาวข้อความ การมีเครื่องหมายคำถาม
  และคีย์เวิร์ดหัวข้อที่ดึงออกมา โดยเก็บ 75% ล่าสุดไว้ครบ แล้วกู้เฉพาะข้อความเก่าที่คะแนนสูงกลับมา

บทสนทนาจึงอยู่ได้เป็นชั่วโมงโดยที่ payload ไม่โตตาม

### อ่านออกเสียง

มีสามทาง เพื่อให้แอปยังพูดได้แม้ไม่ได้เปิดเซิร์ฟเวอร์

- `expo-speech` ทำงานในเครื่อง ทันที ใช้ได้เสมอ
- **FastAPI server** (`api/tts_server.py`) ใช้ Gemini Live voice API เสียงเป็นธรรมชาติกว่า
- **Flask bridge** (`api/speech_server.py`) อีกเส้นทางผ่าน `av.py`

### เกมกับกระดานคะแนน

| เกม | กติกา |
|---|---|
| **Word Game** | สุ่มตัวอักษรมาหนึ่งตัว ต้องพิมพ์คำอังกฤษจริงที่ขึ้นต้นด้วยตัวนั้น โมเดลเป็นคนตรวจ และมีรายการคำที่ใช้ไปแล้วกันซ้ำ |
| **Translation** | สุ่มประโยคไทยจากคลังที่คัดมา (7 หมวด × 2 ระดับ) ให้แปลเป็นอังกฤษ แล้วโมเดลให้คะแนน |
| **Match** | จับคู่การ์ดอังกฤษกับไทยภายใน 60 วินาที บนคลังคำศัพท์ที่ทำมือไว้ **กว่า 1,400 คำ** |
| **Rank / Scoreboard** | กระดานคะแนนสดและประวัติการเล่นของตัวเอง เก็บลง Firebase Realtime Database |

### ล็อกอินที่เปิดแอปได้ทันที

ใช้ Firebase Auth (อีเมลกับรหัสผ่าน และ Google Sign-In) แล้วสำเนา session ลง AsyncStorage
เปิดแอปมาจึงแสดงสถานะล็อกอินล่าสุดได้เลย แล้วค่อยไปเช็คกับ Firebase เบื้องหลัง ไม่ต้องรอเน็ต

---

## สถาปัตยกรรม

![ELIC Architecture](./architecture-diagram.svg)

```
┌──────────────────────────────────────────────┐
│  React Native / Expo  ·  13 หน้าจอ            │
│  React Navigation (stack)                    │
└───────┬─────────────────┬──────────────┬─────┘
        │                 │              │
        ▼                 ▼              ▼
┌───────────────┐  ┌─────────────┐  ┌──────────────┐
│ Typhoon       │  │  Firebase   │  │ TTS servers  │
│ ThaiLLM 8B    │  │  Auth       │  │ FastAPI :8000│
│ แชตสอนภาษา     │  │  Firestore  │  │ Flask   :5000│
│               │  │  RTDB       │  │              │
│ Gemini 2.0    │  │  คะแนนเกม    │  │ expo-speech  │
│ เกมกับเสียง    │  │  อันดับ      │  │ สำรอง         │
└───────────────┘  └─────────────┘  └──────────────┘
```

**ใช้สองโมเดล โดยตั้งใจ** ฝั่งแชตใช้ `typhoon-s-thaillm-8b-instruct` ผ่าน ThaiLLM
เพราะเป็นโมเดลที่ปรับมาสำหรับภาษาไทย อธิบายจุดที่ผิดเป็นภาษาไทยได้ดีกว่าโมเดลทั่วไปมาก
ส่วนเกมใช้ `gemini-2.0-flash` เพราะงานคือตรวจคำอังกฤษสั้น ๆ กับให้คะแนนการแปล
ซึ่งความเร็วสำคัญกว่าความคล่องภาษาไทย ฝั่งแชตย้ายออกจาก Gemini เมื่อพฤษภาคม 2026 ด้วยเหตุผลนี้

### หนึ่งเทิร์นของบทสนทนา ตั้งแต่ต้นจนจบ

```
เลือกฉาก      ──► getRolePrompt()   ──┐
8 เทิร์นล่าสุด  ──► formatChatHistory ──┤
ข้อความผู้ใช้  ───────────────────────►├──► POST thaillm.or.th/v1/chat/completions
ระดับความยาก  ───────────────────────►│    temperature 0.5 · max_tokens 1024
รูปแบบผลลัพธ์  ───────────────────────►┘
                                        │
                                        ▼
                        ดึง JSON ออกมาแบบยืดหยุ่น
                                        │
                   ┌────────────────────┼────────────────────┐
                   ▼                    ▼                    ▼
              กล่องแชต          SpellingCorrection    VocabularyTable
                   │
                   └──► [กดลำโพง] ──► expo-speech หรือ TTS server ──► WAV
```

---

## โครงสร้างโปรเจ็ค

```
elic/
├── App.js                      Navigator หลัก และตัวฟังสถานะล็อกอิน
├── config/firebase.js          ตั้งค่า Firebase
├── screens/
│   ├── ChatScreen.js           หน้าแชต ประกอบ prompt และแกะคำตอบ (~1,950 บรรทัด)
│   ├── LoginScreen.js  LoginApp.js  SignUpApp.js  ForgotPassword.js
│   ├── menu.js  profile.js
│   ├── option/
│   │   ├── getRolePrompt.js    แปลงฉากเป็น system prompt
│   │   ├── Settings.js         เลือกฉากและระดับความยาก
│   │   ├── random.js           คลังคำศัพท์ไทย/อังกฤษ 1,400+ คำ
│   │   └── random1.js          คลังประโยคไทย 7 หมวด × 2 ระดับ
│   └── game/
│       ├── WordGame.js  Translation.js  Match.js
│       └── Rank.js  Scoreboard.js
├── components/QuickMessageOptions.js
├── api/
│   ├── tts_server.py           FastAPI + Gemini Live voice  (:8000)
│   └── speech_server.py        Flask bridge ผ่าน av.py      (:5000)
└── .github/workflows/build-apk.yml   สั่ง EAS build แล้วอัปขึ้น Google Drive
```

---

## เริ่มใช้งาน

**ต้องมีก่อน** Node.js 20 ขึ้นไป, Expo CLI, Android Studio หรือเครื่องจริง,
โปรเจ็ค Firebase ที่เปิด Auth + Firestore + Realtime Database, API key ของ ThaiLLM และของ Google Gemini

```bash
git clone https://github.com/watcharaponthod-code/elic.git
cd elic
npm install
npx expo start
```

กด `a` เพื่อเปิดบน Android หรือสแกน QR ด้วย Expo Go

### ตั้งค่า

สร้างไฟล์ `config/.env` ไฟล์นี้อยู่ใน gitignore และไม่ควรมี key ตัวไหนหลุดเข้าซอร์สโค้ด

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

### ถ้าจะรัน TTS server ด้วย

```bash
pip install fastapi uvicorn google-generativeai python-multipart
python api/tts_server.py
```

---

## การ build APK

`.github/workflows/build-apk.yml` ทำให้ทั้งกระบวนการรันบน GitHub Actions

1. สั่ง **Build APK with EAS** จากแท็บ Actions เลือก `preview` หรือ `production`
2. EAS คอมไพล์บนเครื่องของ Expo แล้วคืน `build_id` กลับมา
3. อีก job หนึ่งตามรอ build ตัวนั้นโดยเฉพาะ ดาวน์โหลด APK แล้วอัปขึ้น Google Drive

ต้องตั้ง repository secrets: `EXPO_TOKEN`, `MATON_API_KEY`
รายละเอียดเต็มอยู่ใน [HOW-TO-BUILD.md](HOW-TO-BUILD.md)

---

## ดาวน์โหลด

APK ที่ build ไว้แล้ว: **[Google Drive](https://drive.google.com/drive/folders/1_733nt1TTmaK9fqcgd-cGJRLJuieBpj5)**
· วิธีติดตั้งอยู่ใน [DOWNLOAD.md](DOWNLOAD.md)

---

## ไทม์ไลน์

| | |
|---|---|
| **ส.ค. 2024** | commit แรก ต้นแบบหน้าแชตที่คุยกับ LLM รุ่นแรก ๆ |
| **มี.ค. - มิ.ย. 2025** | เกม กระดานคะแนนบน Firebase หน้าโปรไฟล์ และ TTS server |
| **ต.ค. 2025** | รื้อ UI ใหม่ |
| **พ.ค. 2026** | ย้ายแชตไป Typhoon ThaiLLM 8B · Google Sign-In · ระบบปล่อยเวอร์ชันด้วย EAS + GitHub Actions |

48 commits · โค้ดราว 14,600 บรรทัด

---

## เครื่องมือที่ใช้

| | |
|---|---|
| มือถือ | React Native 0.76.9, Expo SDK 52 |
| Navigation | React Navigation 6 (stack) |
| LLM ฝั่งแชต | Typhoon `typhoon-s-thaillm-8b-instruct` (ThaiLLM) |
| LLM ฝั่งเกม | Google `gemini-2.0-flash` |
| ล็อกอิน | Firebase Authentication + Google Sign-In |
| ข้อมูล | Cloud Firestore, Realtime Database, AsyncStorage |
| อ่านออกเสียง | expo-speech · FastAPI + Gemini Live voice · Flask |
| Build | EAS Build, GitHub Actions |

---

## สัญญาอนุญาต

MIT ดูที่ [LICENSE](LICENSE)
