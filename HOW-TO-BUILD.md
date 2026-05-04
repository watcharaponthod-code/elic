# 🔨 How to Build and Upload ELIC APK

This guide explains how to build the ELIC APK and upload it to Google Drive for distribution.

---

## 🚀 Quick Start (Automated)

Use the automated script to build and upload in one command:

```bash
# Set your Maton API key
export MATON_API_KEY='your_api_key_here'

# Run the automated script
./build-and-upload.sh
```

The script will:
1. ✅ Check and install EAS CLI if needed
2. ✅ Verify Expo authentication
3. ✅ Build the Android APK (10-20 minutes)
4. ✅ Download the built APK
5. ✅ Upload to Google Drive automatically
6. ✅ Generate shareable download links

---

## 📋 Manual Build Process

If you prefer manual control:

### Step 1: Install Requirements

```bash
# Install EAS CLI globally
npm install -g eas-cli

# Install project dependencies
npm install
```

### Step 2: Login to Expo

```bash
eas login
```

Enter your Expo credentials when prompted.

### Step 3: Build APK

```bash
# Build APK for Android (preview profile)
eas build --platform android --profile preview

# Or for production
eas build --platform android --profile production
```

**Build time**: Approximately 10-20 minutes

### Step 4: Download APK

After the build completes:

1. **Option A**: Download from terminal
   ```bash
   # List recent builds
   eas build:list --platform android --limit 5

   # Get the build URL
   eas build:view <build-id>
   ```

2. **Option B**: Download from dashboard
   - Visit: https://expo.dev/accounts/mojo093/projects/Elic/builds
   - Find the latest build
   - Click "Download" button

### Step 5: Upload to Google Drive

#### Using Python (Automated)

```bash
export MATON_API_KEY='your_api_key'

python3 << 'EOF'
import urllib.request, os, json

apk_file = "path/to/your/ELIC.apk"
folder_id = "1_733nt1TTmaK9fqcgd-cGJRLJuieBpj5"

# Read APK file
with open(apk_file, 'rb') as f:
    apk_content = f.read()

# Upload to Google Drive
file_metadata = {
    'name': os.path.basename(apk_file),
    'parents': [folder_id]
}

boundary = '-------314159265358979323846'
body = (
    f'--{boundary}\r\n'
    f'Content-Type: application/json; charset=UTF-8\r\n\r\n'
    f'{json.dumps(file_metadata)}\r\n'
    f'--{boundary}\r\n'
    f'Content-Type: application/vnd.android.package-archive\r\n\r\n'
).encode() + apk_content + f'\r\n--{boundary}--'.encode()

req = urllib.request.Request(
    'https://gateway.maton.ai/google-drive/upload/drive/v3/files?uploadType=multipart',
    data=body,
    method='POST'
)
req.add_header('Authorization', f'Bearer {os.environ["MATON_API_KEY"]}')
req.add_header('Content-Type', f'multipart/related; boundary={boundary}')

response = urllib.request.urlopen(req)
result = json.load(response)
file_id = result['id']

# Make public
permission = {'type': 'anyone', 'role': 'reader'}
data = json.dumps(permission).encode()
req = urllib.request.Request(
    f'https://gateway.maton.ai/google-drive/drive/v3/files/{file_id}/permissions',
    data=data,
    method='POST'
)
req.add_header('Authorization', f'Bearer {os.environ["MATON_API_KEY"]}')
req.add_header('Content-Type', 'application/json')
urllib.request.urlopen(req)

print(f"✅ Upload successful!")
print(f"Download: https://drive.google.com/uc?export=download&id={file_id}")
print(f"View: https://drive.google.com/file/d/{file_id}/view")
EOF
```

#### Manual Upload

1. Go to: https://drive.google.com/drive/folders/1_733nt1TTmaK9fqcgd-cGJRLJuieBpj5
2. Click "New" → "File upload"
3. Select your APK file
4. Wait for upload to complete
5. Right-click the file → "Share" → "Anyone with the link"

---

## 🎯 Build Profiles

The project includes multiple build profiles in `eas.json`:

### Preview (Recommended for Testing)
```bash
eas build --platform android --profile preview
```
- **Output**: APK file
- **Size**: ~50-100 MB
- **Installation**: Direct APK install
- **Use case**: Testing, internal distribution

### Production (For Release)
```bash
eas build --platform android --profile production
```
- **Output**: AAB file (for Play Store)
- **Size**: Optimized
- **Installation**: Through Play Store
- **Use case**: Official releases

---

## 🔍 Verify Build

After building, verify the APK:

```bash
# Get build details
eas build:view <build-id>

# Check build logs
eas build:log <build-id>

# List all builds
eas build:list --platform android
```

---

## 📱 Test the APK

### On Physical Device

1. Enable "Install from Unknown Sources":
   - Settings → Security → Unknown Sources
   - Or: Settings → Apps → Special access → Install unknown apps

2. Transfer APK to device:
   ```bash
   adb install path/to/ELIC.apk
   ```
   Or share via Google Drive link

3. Open and test the app

### On Emulator

```bash
# Start emulator
emulator -avd Pixel_5_API_31

# Install APK
adb install ELIC.apk

# Launch app
adb shell am start -n com.mojo093.Elic/.MainActivity
```

---

## 🔧 Troubleshooting

### Build Failed

**Issue**: Build fails with error
**Solution**:
```bash
# Check expo-doctor
npx expo-doctor

# Clear cache and rebuild
eas build:clear-cache
eas build --platform android --profile preview
```

### EAS Login Failed

**Issue**: Cannot login to Expo
**Solution**:
```bash
# Logout and login again
eas logout
eas login

# Or use token
eas login --token YOUR_TOKEN
```

### Upload to Google Drive Failed

**Issue**: Python script fails
**Solution**:
1. Check MATON_API_KEY is set
2. Verify Google Drive connection:
   ```bash
   python3 << 'EOF'
   import urllib.request, os, json
   req = urllib.request.Request('https://ctrl.maton.ai/connections?app=google-drive')
   req.add_header('Authorization', f'Bearer {os.environ["MATON_API_KEY"]}')
   print(json.load(urllib.request.urlopen(req)))
   EOF
   ```

### APK Too Large

**Issue**: APK size > 100MB
**Solution**:
1. Enable ProGuard/R8 in `eas.json`
2. Remove unused assets
3. Use app bundle (AAB) instead

---

## 📊 Build Status

Check build status:
- **Dashboard**: https://expo.dev/accounts/mojo093/projects/Elic/builds
- **API**: `eas build:list --json`

---

## 🔄 Update Workflow

When you update the app:

1. Make code changes
2. Update version in `app.json`:
   ```json
   {
     "expo": {
       "version": "1.0.1"
     }
   }
   ```
3. Build new APK:
   ```bash
   ./build-and-upload.sh
   ```
4. APK automatically uploads to Google Drive
5. Users download the latest version

---

## 📞 Support

- **Build Issues**: Check [Expo Docs](https://docs.expo.dev/build/introduction/)
- **EAS CLI**: https://docs.expo.dev/eas/cli/
- **Google Drive API**: https://developers.google.com/drive
- **Maton API**: https://maton.ai/docs

---

## 🎉 Success Checklist

- [ ] EAS CLI installed
- [ ] Logged in to Expo
- [ ] Build completed successfully
- [ ] APK downloaded
- [ ] APK uploaded to Google Drive
- [ ] APK accessible via README link
- [ ] APK tested on device

---

**Last Updated**: 2026-05-04
**Maintainer**: Watcharapon Tosrakza
**Google Drive Folder**: https://drive.google.com/drive/folders/1_733nt1TTmaK9fqcgd-cGJRLJuieBpj5
