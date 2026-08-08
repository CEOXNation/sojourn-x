# Mobile release checklist

SojournX is configured as an Expo app for iOS (`com.sojournx.app`) and Android (`com.sojournx.app`). Use EAS Build for native binaries; Vercel continues to host only the web export.

## Before the first build

1. Sign in to the Expo account that owns the EAS project and run `eas project:info`.
2. Confirm that `expo.extra.eas.projectId` in `app.json` matches the project ID returned by EAS. Run `eas init` if the app has not yet been linked to an EAS project.
3. Run `npm install` followed by `npm run preflight`.
4. Confirm that the app icon, splash screen, permissions text, privacy policy, and support contact are final.

## Internal beta

Build both platforms with:

```bash
npm run eas:build:beta
```

The preview profile produces an Android APK for direct testers and an iOS internal-distribution build. Use the EAS build page to share the platform-specific install link with authorized testers.

## Store release

1. Enroll the publishing organization in the Apple Developer Program and Google Play Console.
2. Create the Apple App Store Connect record for bundle ID `com.sojournx.app`, then obtain its Apple ID, App Store Connect app ID, and Apple team ID.
3. Create the Google Play application for package `com.sojournx.app`, then create a Play Console service account and grant it release access.
4. Provide those values through secure EAS credentials/configuration. Do not commit the service-account JSON or any credentials to this repository.
5. Build the production artifacts and submit them:

```bash
npx eas build --profile production --platform all
npm run eas:submit
```

Apple submission requires App Store review/TestFlight processing. Android submission lands in the selected Play testing or production track configured in EAS/Play Console.
