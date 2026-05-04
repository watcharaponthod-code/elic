# 📱 ELIC - Download & Test Guide

## 🎉 README อัพเดทเรียบร้อยแล้ว!

ตรวจสอบ README ใหม่ได้ที่: **[https://github.com/watcharaponthod-code/elic](https://github.com/watcharaponthod-code/elic)**

---

## 📥 วิธีดาวน์โหลดและทดสอบแอพ

### วิธีที่ 1: ทดสอบผ่าน Expo Go (แนะนำ - ง่ายที่สุด)

1. **ติดตั้ง Expo Go บนมือถือ:**
   - Android: [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)

2. **เปิดแอพผ่าน Expo:**
   ```
   exp://exp.host/@mojo093/Elic
   ```

   หรือเปิด URL นี้ในเบราว์เซอร์มือถือ:
   ```
   https://expo.dev/@mojo093/Elic
   ```

### วิธีที่ 2: Build APK เอง

#### ขั้นตอนการ Build:

```bash
# 1. ติดตั้ง EAS CLI
npm install -g eas-cli

# 2. ไปที่โฟลเดอร์โปรเจกต์
cd elic

# 3. ติดตั้ง dependencies
npm install

# 4. Login เข้า Expo
eas login

# 5. Build APK (preview profile)
eas build --platform android --profile preview

# หรือ Build แบบ production
eas build --platform android --profile production
```

#### ดาวน์โหลด APK ที่ Build แล้ว:

เมื่อ build เสร็จ คุณจะได้รับ URL สำหรับดาวน์โหลด APK

ตรวจสอบ builds ที่มีอยู่:
```bash
eas build:list --platform android
```

หรือเข้าไปดูที่:
**[https://expo.dev/accounts/mojo093/projects/Elic/builds](https://expo.dev/accounts/mojo093/projects/Elic/builds)**

---

## 🔧 การติดตั้ง APK บน Android

1. **เปิดใช้งาน "Install from Unknown Sources":**
   - Settings → Security → Unknown Sources → เปิดใช้งาน
   - หรือ Settings → Apps & notifications → Special app access → Install unknown apps

2. **ดาวน์โหลดไฟล์ APK**

3. **เปิดไฟล์ APK และกด Install**

4. **เปิดแอพ ELIC**

---

## 🚀 วิธีการรันโปรเจกต์ในโหมด Development

### สำหรับผู้พัฒนา:

```bash
# 1. Clone repository
git clone https://github.com/watcharaponthod-code/elic.git
cd elic

# 2. ติดตั้ง dependencies
npm install

# 3. ตั้งค่า environment variables
# สร้างไฟล์ config/.env และใส่:
# GEMINI_API_KEY=your_api_key
# THAILLM_API_KEY=your_api_key
# FIREBASE_API_KEY=your_firebase_config

# 4. เริ่ม development server
npm start

# 5. เลือกแพลตฟอร์ม:
#    - กด 'a' สำหรับ Android
#    - กด 'i' สำหรับ iOS
#    - กด 'w' สำหรับ Web
#    หรือสแกน QR code ด้วย Expo Go
```

### รันผ่าน PM2 (Production):

```bash
# Build production bundle
npm run build

# รันด้วย PM2
pm2 start npm --name "elic" -- start

# ดู logs
pm2 logs elic

# หยุด
pm2 stop elic
```

---

## 📊 ตรวจสอบสถานะการ Build

### ผ่าน EAS CLI:

```bash
# ดู builds ทั้งหมด
eas build:list

# ดูรายละเอียด build
eas build:view <build-id>

# ดู build log
eas build:log <build-id>
```

### ผ่าน Web Dashboard:

เข้าไปที่: [https://expo.dev/accounts/mojo093/projects/Elic/builds](https://expo.dev/accounts/mojo093/projects/Elic/builds)

---

## 🔗 ลิงก์สำคัญ

| ชื่อ | URL |
|------|-----|
| **GitHub Repository** | [watcharaponthod-code/elic](https://github.com/watcharaponthod-code/elic) |
| **README (ใหม่)** | [README.md](https://github.com/watcharaponthod-code/elic/blob/main/README.md) |
| **Architecture Diagram** | [architecture-diagram.svg](https://github.com/watcharaponthod-code/elic/blob/main/architecture-diagram.svg) |
| **Expo Project** | [@mojo093/Elic](https://expo.dev/@mojo093/Elic) |
| **EAS Builds** | [Builds Dashboard](https://expo.dev/accounts/mojo093/projects/Elic/builds) |
| **Demo Video** | [YouTube](https://youtu.be/PKXDnShNFuY) |

---

## 📱 QR Code สำหรับทดสอบด่วน

### Expo Go QR Code:

หากคุณมี Expo Go ติดตั้งอยู่แล้ว สแกน QR code นี้:

```
สร้าง QR code จาก URL: exp://exp.host/@mojo093/Elic
```

หรือพิมพ์ URL นี้ใน Expo Go:
```
@mojo093/Elic
```

---

## 🛠️ Troubleshooting

### ปัญหา: "Something went wrong"

**วิธีแก้:**
1. ตรวจสอบว่าติดตั้ง dependencies ครบหรือไม่: `npm install`
2. Clear cache: `expo start -c`
3. ลบ node_modules และติดตั้งใหม่:
   ```bash
   rm -rf node_modules
   npm install
   ```

### ปัญหา: ไม่สามารถเชื่อมต่อ Firebase

**วิธีแก้:**
1. ตรวจสอบไฟล์ `config/.env` ว่ามี Firebase config ครบหรือไม่
2. ตรวจสอบว่า Firebase project เปิดใช้งาน Authentication แล้ว
3. ตรวจสอบ network connectivity

### ปัญหา: AI ไม่ตอบกลับ

**วิธีแก้:**
1. ตรวจสอบ GEMINI_API_KEY ใน config/.env
2. ตรวจสอบว่า API key ยังใช้งานได้
3. ตรวจสอบ quota ของ Gemini API

---

## 💡 Tips

### การทดสอบที่รวดเร็ว:
- ใช้ Expo Go สำหรับทดสอบระหว่างพัฒนา
- Build APK เมื่อต้องการแจกจ่ายให้ผู้อื่นทดสอบ

### การ Debug:
- เปิด Developer Menu: เขย่ามือถือ หรือ Cmd+D (iOS) / Cmd+M (Android)
- ดู console logs ใน terminal ที่รัน `npm start`
- ใช้ React DevTools สำหรับ debug UI

### Performance:
- ใช้ `--dev false` เมื่อทดสอบ performance
- Profile ด้วย React DevTools Profiler
- ตรวจสอบ memory leaks ด้วย Android Studio Profiler

---

## 📞 ต้องการความช่วยเหลือ?

- **GitHub Issues**: [สร้าง issue](https://github.com/watcharaponthod-code/elic/issues)
- **Email**: watcharapon.t@example.com
- **Documentation**: [README.md](https://github.com/watcharaponthod-code/elic/blob/main/README.md)

---

<div align="center">

### ขอบคุณที่ใช้ ELIC! 🎉

**Made with ❤️ and AI**

[![GitHub](https://img.shields.io/badge/GitHub-watcharaponthod--code/elic-181717?logo=github)](https://github.com/watcharaponthod-code/elic)
[![Expo](https://img.shields.io/badge/Expo-@mojo093/Elic-000020?logo=expo)](https://expo.dev/@mojo093/Elic)

</div>
