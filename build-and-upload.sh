#!/bin/bash

# ELIC APK Build and Upload Script
# This script builds the APK and uploads it to Google Drive

echo "╔══════════════════════════════════════════════════════════╗"
echo "║     ELIC APK Build & Upload to Google Drive            ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if EAS CLI is installed
if ! command -v eas &> /dev/null; then
    echo -e "${RED}✗ EAS CLI not found${NC}"
    echo "Installing EAS CLI..."
    npm install -g eas-cli
fi

# Check if logged in to Expo
echo -e "${BLUE}Checking Expo authentication...${NC}"
if ! eas whoami &> /dev/null; then
    echo -e "${RED}✗ Not logged in to Expo${NC}"
    echo "Please log in:"
    eas login
fi

# Build APK
echo ""
echo -e "${BLUE}📱 Building Android APK...${NC}"
echo "This may take 10-20 minutes..."
echo ""

eas build --platform android --profile preview --non-interactive

# Check if build succeeded
if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Build failed${NC}"
    exit 1
fi

# Get the latest build
echo ""
echo -e "${BLUE}📥 Fetching build info...${NC}"

BUILD_INFO=$(eas build:list --platform android --limit 1 --json)
BUILD_URL=$(echo $BUILD_INFO | jq -r '.[0].artifacts.buildUrl')
BUILD_ID=$(echo $BUILD_INFO | jq -r '.[0].id')

if [ "$BUILD_URL" == "null" ] || [ -z "$BUILD_URL" ]; then
    echo -e "${RED}✗ Could not get build URL${NC}"
    echo "Please check EAS builds dashboard:"
    echo "https://expo.dev/accounts/mojo093/projects/Elic/builds"
    exit 1
fi

echo -e "${GREEN}✓ Build completed${NC}"
echo "  Build ID: $BUILD_ID"
echo "  Download URL: $BUILD_URL"

# Download APK
echo ""
echo -e "${BLUE}⬇️  Downloading APK...${NC}"
wget -O "ELIC-${BUILD_ID}.apk" "$BUILD_URL"

if [ ! -f "ELIC-${BUILD_ID}.apk" ]; then
    echo -e "${RED}✗ Download failed${NC}"
    exit 1
fi

APK_SIZE=$(du -h "ELIC-${BUILD_ID}.apk" | cut -f1)
echo -e "${GREEN}✓ Downloaded${NC} (Size: $APK_SIZE)"

# Upload to Google Drive
echo ""
echo -e "${BLUE}☁️  Uploading to Google Drive...${NC}"

# Note: This requires MATON_API_KEY environment variable
if [ -z "$MATON_API_KEY" ]; then
    echo -e "${RED}✗ MATON_API_KEY not set${NC}"
    echo "Please set your Maton API key:"
    echo "export MATON_API_KEY='your_api_key'"
    echo ""
    echo "Or upload manually to:"
    echo "https://drive.google.com/drive/folders/1_733nt1TTmaK9fqcgd-cGJRLJuieBpj5"
    echo ""
    echo "APK file location: $(pwd)/ELIC-${BUILD_ID}.apk"
    exit 1
fi

python3 << 'PYEOF'
import urllib.request, os, json, sys

apk_file = sys.argv[1]
folder_id = "1_733nt1TTmaK9fqcgd-cGJRLJuieBpj5"

print(f"Uploading {apk_file}...")

# Read APK file
with open(apk_file, 'rb') as f:
    apk_content = f.read()

# Upload using simple upload
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

try:
    response = urllib.request.urlopen(req)
    result = json.load(response)
    file_id = result['id']
    
    # Make file publicly accessible
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
    
    print(f"✓ Upload successful!")
    print(f"  File ID: {file_id}")
    print(f"  Direct download: https://drive.google.com/uc?export=download&id={file_id}")
    print(f"  View in Drive: https://drive.google.com/file/d/{file_id}/view")
    
except Exception as e:
    print(f"✗ Upload failed: {e}")
    sys.exit(1)

PYEOF "ELIC-${BUILD_ID}.apk"

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║              ✓ All Done!                                ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "Your APK is now available on Google Drive!"
    echo "Folder: https://drive.google.com/drive/folders/1_733nt1TTmaK9fqcgd-cGJRLJuieBpj5"
else
    echo -e "${RED}✗ Upload failed${NC}"
    exit 1
fi
