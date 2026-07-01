# SojournX — iOS App

This directory contains the standalone **iOS distribution project** for SojournX. It shares all source code with the root project but is configured exclusively for Apple platforms (iPhone + iPad) with full TestFlight and App Store distribution support.

---

## Project structure

```
ios-app/
├── App.tsx              # Entry — re-exports shared BetaApp
├── index.js             # Expo root component registration
├── app.json             # iOS-specific Expo config (bundle ID, entitlements, privacy manifest)
├── eas.json             # EAS Build profiles: development · preview (TestFlight) · adhoc · production (App Store)
├── metro.config.js      # Watches monorepo root; stubs out Vercel web analytics
├── tsconfig.json        # TypeScript config scoped to iOS project + shared src/
├── mocks/               # No-op stubs for web-only packages (@vercel/analytics, etc.)
├── store-metadata/      # App Store Connect copy (description, keywords, etc.)
└── .gitignore
```

All shared code lives in `../src/`, `../BetaApp.tsx`, and `../src/assets/`. No source is duplicated.

---

## Prerequisites

| Tool | Minimum version | Install |
|------|----------------|---------|
| Node.js | 20 LTS | https://nodejs.org |
| Expo CLI | 14+ | `npm i -g expo-cli` |
| EAS CLI | 14+ | `npm i -g eas-cli` |
| Xcode | 16+ | Mac App Store |
| Apple Developer Program | Active membership | https://developer.apple.com |

---

## First-time setup

```bash
# 1. Install dependencies (from this directory)
cd ios-app
npm install

# 2. Log in to your EAS / Expo account
eas login

# 3. Link to your EAS project (only needed once)
eas init --id <your-expo-project-id>
```

> **Note:** You must have an Apple Developer account and an app record created in [App Store Connect](https://appstoreconnect.apple.com) before running EAS builds that target the App Store.

---

## Running locally on a simulator

```bash
npm run start:simulator
```

Or use the Expo Go app on a physical device:

```bash
npm run start
```

Scan the QR code in the Expo CLI output with the **Expo Go** app (iOS 16+).

---

## iOS Distribution methods

### 1. Development build (Xcode simulator / physical device)

Best for: iterating locally without Expo Go limitations.

```bash
npm run prebuild          # generates the native ios/ Xcode project
npm run eas:build:dev     # EAS cloud build for simulator
```

Or open in Xcode directly after `npm run prebuild`:
```bash
open ios/SojournX.xcworkspace
```

---

### 2. TestFlight — internal & external beta (up to 10,000 testers)

Best for: validating builds with real testers before the App Store.

```bash
# Build and upload to TestFlight
npm run eas:build:beta

# Then distribute via App Store Connect > TestFlight
```

**Workflow:**
1. EAS builds the `.ipa` and automatically uploads it to App Store Connect.
2. Open [App Store Connect → TestFlight](https://appstoreconnect.apple.com).
3. Add internal testers (up to 100 from your team, no review needed).
4. For external beta: submit for Beta App Review (usually approved within 24–48 h).
5. Send the TestFlight invite link to up to 10,000 external testers.

---

### 3. Ad Hoc — direct `.ipa` to up to 100 registered devices

Best for: sending builds to stakeholders without TestFlight.

```bash
npm run eas:build:adhoc   # uses the "adhoc" profile inside eas.json
```

Testers install the `.ipa` using Apple Configurator 2 or a MDM solution. Device UDIDs must be registered in your Apple Developer portal first.

---

### 4. Unlisted App Store listing — hidden from search, link-only access

Best for: controlled public access before a full launch.

1. Build and submit with `npm run eas:build:store && npm run eas:submit`.
2. In App Store Connect, set **Availability** to *Not Available on the App Store*.
3. Share the direct App Store link with your target audience.
4. Flip to full public availability when you are ready to launch.

---

### 5. Production — public App Store release

Best for: full public launch.

```bash
# Build the production .ipa
npm run eas:build:store

# Submit to App Store Connect for review
npm run eas:submit
```

**Before submitting, fill in `eas.json` → `submit.production.ios`:**

```jsonc
"ios": {
  "appleId": "your@apple.id",
  "ascAppId": "1234567890",      // App ID from App Store Connect
  "appleTeamId": "ABCDE12345"   // Team ID from developer.apple.com/account
}
```

Apple review typically takes 24–72 hours for a new app.

---

### 6. Apple Developer Enterprise Program — internal-only distribution

Best for: distributing SojournX strictly within your organisation without any App Store involvement.

> Requires a separate **Apple Developer Enterprise Program** membership ($299/year).

1. Change the `eas.json` `adhoc` profile's `enterpriseProvisioning` to `"universal"`.
2. Build with `npm run eas:build:beta` (adhoc profile).
3. Host the `.ipa` + a manifest `.plist` on a secure HTTPS server.
4. Users install via a direct link (OTA enterprise distribution).

---

## OTA updates (without a new App Store review)

Once the app is installed, you can push JavaScript bundle updates instantly using EAS Update:

```bash
npm run eas:update
```

This updates the `beta` channel. Users will receive the new bundle on the next app launch. Native code changes (new plugins, permissions) still require a full EAS Build + App Store re-submission.

---

## Privacy & App Store compliance checklist

- [ ] `ITSAppUsesNonExemptEncryption: false` is set in `app.json` (standard HTTPS only)
- [ ] `NSPrivacyAccessedAPITypes` privacy manifest covers `UserDefaults` (AsyncStorage)
- [ ] Contacts permission string is meaningful and accurate
- [ ] Age gate is present (SojournX is adults-only)
- [ ] No third-party analytics SDKs are bundled in the iOS build (Vercel analytics is web-only and stubbed out)
- [ ] App Store Connect privacy nutrition label matches actual data collection

---

## Environment variables

Create a `.env` file in this directory (it is gitignored):

```
EXPO_PUBLIC_APP_ENV=production
```

Access in code via `process.env.EXPO_PUBLIC_APP_ENV`.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Metro can't find `../src/` | Run `npm run start:clean` to clear the Metro cache |
| `expo prebuild` fails | Delete `ios/` and re-run `npm run prebuild` |
| EAS build fails on missing provisioning | Run `eas credentials` to set up certificates interactively |
| Simulator build doesn't launch | Ensure Xcode command-line tools are active: `xcode-select --install` |
