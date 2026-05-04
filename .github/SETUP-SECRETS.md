# 🔐 Setup GitHub Secrets for Automated APK Build

To enable automated APK building and uploading, you need to add the following secrets to your GitHub repository.

---

## Required Secrets

### 1. `EXPO_TOKEN` - Expo/EAS Authentication

This token allows GitHub Actions to authenticate with Expo and trigger EAS builds.

#### How to get your EXPO_TOKEN:

1. **Login to Expo**:
   ```bash
   npx expo login
   ```

2. **Generate token**:
   ```bash
   npx expo whoami
   ```

3. **Or create a new token**:
   - Visit: https://expo.dev/accounts/[your-username]/settings/access-tokens
   - Click "Create Token"
   - Name it: "GitHub Actions"
   - Copy the token (you won't see it again!)

### 2. `MATON_API_KEY` - Google Drive Upload

This key allows automated upload of the built APK to Google Drive.

#### How to get your MATON_API_KEY:

1. Visit: https://maton.ai/settings
2. Copy your API key
3. Add it to GitHub Secrets

---

## Adding Secrets to GitHub

### Method 1: GitHub Web UI

1. **Go to your repository**:
   ```
   https://github.com/watcharaponthod-code/elic
   ```

2. **Navigate to Settings**:
   - Click "Settings" tab
   - In the left sidebar, click "Secrets and variables" → "Actions"

3. **Add each secret**:
   - Click "New repository secret"
   - Name: `EXPO_TOKEN`
   - Value: [paste your Expo token]
   - Click "Add secret"

   - Click "New repository secret" again
   - Name: `MATON_API_KEY`
   - Value: [paste your Maton API key]
   - Click "Add secret"

### Method 2: GitHub CLI

```bash
# Install GitHub CLI if needed
brew install gh  # macOS
# or: sudo apt install gh  # Linux
# or: winget install GitHub.cli  # Windows

# Login
gh auth login

# Add secrets
gh secret set EXPO_TOKEN
# Paste your token when prompted

gh secret set MATON_API_KEY
# Paste your Maton API key when prompted
```

---

## Verify Secrets

After adding secrets, verify they're set correctly:

```bash
gh secret list --repo watcharaponthod-code/elic
```

You should see:
```
EXPO_TOKEN       Updated YYYY-MM-DD
MATON_API_KEY    Updated YYYY-MM-DD
```

---

## Trigger the Build

Once secrets are added, you can trigger the build in multiple ways:

### Option 1: Manual Trigger (Recommended)

1. Go to: https://github.com/watcharaponthod-code/elic/actions
2. Click "Build Android APK" workflow
3. Click "Run workflow"
4. Select branch: `main`
5. Select profile: `preview` (for testing) or `production` (for release)
6. Click "Run workflow"

### Option 2: Automatic Trigger

The workflow automatically runs when you:
- Push changes to `main` branch
- Modify `app.json`, `package.json`, or `eas.json`

### Option 3: GitHub CLI

```bash
gh workflow run build-apk.yml \
  --repo watcharaponthod-code/elic \
  --ref main \
  --field profile=preview
```

---

## Workflow Steps

Once triggered, the workflow will:

1. ✅ Checkout repository
2. ✅ Install dependencies
3. ✅ Setup Expo/EAS
4. ✅ **Build APK** (~10-20 minutes)
5. ✅ Wait for build completion
6. ✅ Download APK
7. ✅ Upload to Google Drive
8. ✅ Comment on commit with download link

---

## Check Build Status

Monitor your build:

1. **GitHub Actions**: https://github.com/watcharaponthod-code/elic/actions
2. **EAS Dashboard**: https://expo.dev/accounts/mojo093/projects/Elic/builds
3. **Google Drive**: https://drive.google.com/drive/folders/1_733nt1TTmaK9fqcgd-cGJRLJuieBpj5

---

## Troubleshooting

### "EXPO_TOKEN" secret not found

**Solution**: Make sure you added the secret with exact name `EXPO_TOKEN` (case-sensitive)

### "Authentication failed"

**Solution**:
1. Regenerate your Expo token
2. Update the GitHub secret
3. Re-run the workflow

### "Build failed"

**Solution**:
1. Check EAS dashboard for detailed error logs
2. Verify `eas.json` configuration
3. Check `app.json` for correct project ID

### "Upload to Google Drive failed"

**Solution**:
1. Verify `MATON_API_KEY` is correct
2. Check Google Drive connection at: https://ctrl.maton.ai/connections?app=google-drive
3. Ensure folder ID is correct: `1_733nt1TTmaK9fqcgd-cGJRLJuieBpj5`

---

## Quick Start Checklist

- [ ] Get EXPO_TOKEN from Expo dashboard
- [ ] Get MATON_API_KEY from Maton settings
- [ ] Add both secrets to GitHub repository
- [ ] Verify secrets are added: `gh secret list`
- [ ] Trigger workflow manually or by pushing to main
- [ ] Monitor build in GitHub Actions
- [ ] Check EAS dashboard for build progress
- [ ] Download APK from Google Drive when complete
- [ ] Test APK on Android device

---

## Security Notes

- ⚠️ **Never commit secrets** to your repository
- ⚠️ **Never share your tokens** publicly
- ⚠️ **Regenerate tokens** if they're exposed
- ✅ GitHub Secrets are **encrypted** and only accessible to workflows
- ✅ Secret values are **masked** in workflow logs

---

## Need Help?

- 📖 GitHub Secrets: https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions
- 🚀 EAS Build: https://docs.expo.dev/build/introduction/
- 🔗 Maton API: https://maton.ai/docs
- 💬 Issues: https://github.com/watcharaponthod-code/elic/issues

---

**Last Updated**: 2026-05-04
**Workflow File**: `.github/workflows/build-apk.yml`
