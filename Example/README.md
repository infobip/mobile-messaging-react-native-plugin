# Example app

This app demonstrates the plugin against React Native 0.87.1 and links the local workspace package via `file:../`. It requires node 22.13.0 or higher.

The plugin itself supports React Native 0.86.0 and higher. React Native 0.87.0 is only required when using Swift Package Manager on iOS.

## Setup

From this folder, install dependencies:

```bash
npm install
```

## Android setup

From `Example/android/`, run:

```bash
./gradlew assembleDebug
```

## Run the app

To start Metro and launch the app on Android, run:

```bash
npm run android
```

## iOS setup

The Example application supports both CocoaPods and Swift Package Manager, so you can choose which approach to use.

### CocoaPods setup

To get the native iOS dependencies via CocoaPods, run the following command:

```bash
cd ios && bundle install && bundle exec pod install
```

After that, open `Example.xcworkspace` and run the application on a device, or simply run:

```bash
npm run ios
```

### Swift Package Manager setup

Some dependencies of the Example app don't ship a `Package.swift`. The generated (and, where needed, hand-fixed) manifests are kept in `patches/` and applied automatically by `npm install`, so you don't need to run `npx react-native spm scaffold`.

Run the following command:

```bash
npx react-native spm add --deintegrate
```

Then delete the CocoaPods workspace. `spm add` leaves it in place, and `npm run ios` always prefers `Example.xcworkspace` over `Example.xcodeproj` when both exist:

```bash
rm -rf ios/Example.xcworkspace
```

If you get errors from the CocoaPods cache, delete the leftover CocoaPods files:

```bash
cd ios && bundle exec pod deintegrate && rm -rf Pods
```

Open the `Example.xcodeproj` project and add the `MobileMessagingNotificationExtension` product from https://github.com/infobip/mobile-messaging-sdk-ios to the `MobileMessagingNotificationServiceExtension` target in Xcode (File → Add Package Dependencies…).

Run the application on a device directly from `Example.xcodeproj`, or simply run:

```bash
npm run ios
```

To switch back to CocoaPods, restore the `Podfile` (the `--deintegrate` flag removes the React Native integration from it) and reinstall the pods:

```bash
npx react-native spm deinit
git checkout ios/Podfile
cd ios && bundle exec pod install
```
