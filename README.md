# Mobile Messaging SDK plugin for React Native

[![npm](https://img.shields.io/npm/v/infobip-mobile-messaging-react-native-plugin.svg)](https://www.npmjs.com/package/infobip-mobile-messaging-react-native-plugin)

Mobile Messaging SDK is designed and developed to easily enable push notification channel in your mobile application. In almost no time of implementation you get push notification in your application and access to the features of [Infobip IP Messaging Platform](https://www.infobip.com/en/products/mobile-app-messaging).
The document describes library integration steps for your React Native project.

* [Requirements](#requirements)
* [Quick start guide](#quick-start-guide)
* [Initialization configuration](#initialization-configuration)

## Requirements
- node (v20.19.4 or higher; v22.13.0 or higher if using Swift Package Manager)
- ruby (2.7.8 or higher; the Example app uses 3.3.5)
- React Native (v0.86.0 or higher; v0.87.0 or higher if using Swift Package Manager)

For iOS project:
- Xcode and Command Line Tools (16.x or newer, tested with 27.0.0)
- Minimum deployment target 15.1
- If using CocoaPods: CocoaPods (v1.16.x)

For Android project:
- Android Studio (Narwhal | 2025.1.3)
- JDK 17
- Gradle (v9.4.1)
- Supported API Levels: 24 (Android 7.0 - [Nougat](https://developer.android.com/about/versions/nougat)) - 36 ([Android 16](https://developer.android.com/about/versions/16))

## Quick start guide

This guide is designed to get you up and running with Mobile Messaging SDK plugin for React Native.

1. Make sure to [setup application at Infobip portal](https://www.infobip.com/docs/mobile-app-messaging/getting-started#create-and-enable-a-mobile-application-profile), if you haven't already.

2. Add MobileMessaging plugin to your project, run in terminal:
    ```bash
    $ npm install infobip-mobile-messaging-react-native-plugin
    ```
   TypeScript's definitions are included into npm package

3. Configure platforms

   - **iOS**

      The plugin ships both a CocoaPods podspec and a Swift Package Manager manifest, so your app can integrate it with either dependency manager.

      #### Dependency manager setup

      <details open><summary><b>CocoaPods</b></summary>

      > ### Notice
      > Starting from the [6.2.0](https://github.com/infobip/mobile-messaging-react-native-plugin/releases/tag/6.1.0) plugin version it's not mandatory to add `use_frameworks!` to the `Podfile`, check the [Migration guide](https://github.com/infobip/mobile-messaging-react-native-plugin/wiki/Migration-guides#migration-from-610-to-620-in-case-you-are-getting-rid-of-use_frameworks-in-the-podfile) if you want to get rid of it.

      1. Run `pod install` from `/ios` folder (installs Mobile Messaging native SDK)

      </details>

      <details><summary><b>Swift Package Manager (experimental)</b></summary>

      > Requires React Native 0.87.0 or higher and node 22.13.0 or higher. See the [Swift Package Manager integration](https://github.com/infobip/mobile-messaging-react-native-plugin/wiki/Swift-Package-Manager-integration) guide for details.

      1. If your app currently uses CocoaPods, remove the CocoaPods integration first (from `/ios` folder):
         ```bash
         bundle exec pod deintegrate
         rm -rf Pods <ProjectName>.xcworkspace
         ```
      2. Disable automatic `pod install` in `react-native.config.js`. Otherwise, `react-native run-ios` reinstalls pods whenever a `Podfile` is present:
         ```js
         module.exports = {
           project: {
             ios: { automaticPodsInstallation: false },
           },
         };
         ```
      3. If you use WebRTC UI (the equivalent of `$WebRTCUIEnabled = true` in the `Podfile`), enable it in your app's `package.json`:
         ```json
         "infobipMobileMessaging": {
           "webRTCUI": true
         }
         ```
      4. If other native dependencies of your app don't ship a `Package.swift`, generate one for each of them from the project root:
         ```bash
         npx react-native spm scaffold
         ```
         - the generated files live in `node_modules` and are removed by `npm install`. Persist them with [patch-package](https://github.com/ds300/patch-package) (`npx patch-package <dependency-name>`, then commit the patch), or re-run the command after every install
         - without them, the next step fails with `MissingManifestError`
      5. From the project root, run the following command. React Native reads the plugin's `Package.swift` and wires it, together with the Mobile Messaging native SDK, into your Xcode project automatically:
         ```bash
         npx react-native spm --yes
         ```
         - re-run it after adding, removing or updating native dependencies, or after changing the `webRTCUI` flag
         - open `ios/<ProjectName>.xcodeproj` (not the `.xcworkspace`) in Xcode

      </details>

      2. Import the necessary dependency (depending on the dependency manager) and add `MobileMessagingPluginApplicationDelegate.install()` into `/ios/<ProjectName>/AppDelegate.swift` (this is required for OS callbacks such as `didRegisterForRemoteNotifications` to be intercepted by native MobileMessaging SDK).
      - If using SPM, import the `MobileMessagingReactNative` dependency.
      - If using CocoaPods, import the `MobileMessaging` dependency.

      The AppDelegate should now look like the following:
       ```swift
           import UIKit
           import React
           // if using Swift Package Manager, import the MobileMessagingReactNative dependency
           import MobileMessagingReactNative
           // if using CocoaPods, import the MobileMessaging dependency
           import MobileMessaging

           @main
           class AppDelegate: UIResponder, UIApplicationDelegate {
             func application(
               _ application: UIApplication,
               didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
             ) -> Bool {
               ...
               MobileMessagingPluginApplicationDelegate.install()
               ...
             }
           }
           ...
       ```

      > ### Notice
      > An Objective-C `AppDelegate.m` is only supported with the CocoaPods integration:
      > ```objective-c
      >     ...
      >     #import <MobileMessaging/MobileMessagingPluginApplicationDelegate.h>
      >
      >     @implementation AppDelegate
      >
      >     - (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
      >     {
      >         [MobileMessagingPluginApplicationDelegate install];
      >         ...
      >     }
      >     ...
      > ```
      > Swift Package Manager integration requires a Swift `AppDelegate.swift`.

      3. Configure your project to support Push Notification as described in item 2 of [iOS integration quick start guide](https://github.com/infobip/mobile-messaging-sdk-ios#quick-start-guide)
      4. [Integrate Notification Service Extension](https://github.com/infobip/mobile-messaging-react-native-plugin/wiki/Delivery-improvements-and-rich-content-notifications#setting-up-ios-part) into your app in order to obtain:
         - more accurate processing of messages and delivery stats
         - support of rich notifications on the lock screen
      - If using SPM, follow the guide for integrating the NSE [here](https://github.com/infobip/mobile-messaging-sdk-ios/wiki/Integration-via-Swift-Package-Manager#Notification-Service-Extension).

      > ### Notice (CocoaPods and Swift Package Manager integration):
      > From version `15.1.0`, the plugin supports both **Swift Package Manager** (React Native 0.87 and above, experimental) and **CocoaPods**. After December 2, 2026, CocoaPods will permanently become read-only, so migration to SPM is recommended to get the latest plugin updates.
   - **Android**
      1. Following paths should be provided in .bash_profile
         ```sh
         export ANDROID_HOME=$HOME/Library/Android/sdk
         export PATH=$PATH:$ANDROID_HOME/emulator
         export PATH=$PATH:$ANDROID_HOME/tools
         export PATH=$PATH:$ANDROID_HOME/tools/bin
         export PATH=$PATH:$ANDROID_HOME/platform-tools
         ```
      2. Add `com.google.gms:google-services` to `android/build.gradle` file
         ```groovy
         buildscript {
            ...
            dependencies {
                ...
               // GMS Gradle plugin
               classpath 'com.google.gms:google-services:4.4.2'
            }
         }
         ```
         And add `apply plugin: 'com.google.gms.google-services'` at the end of your `android/app/build.gradle` in order to apply [Google Services Gradle Plugin](https://developers.google.com/android/guides/google-services-plugin)

      3. Add a Firebase configuration file (google-services.json) as described in <a href="https://firebase.google.com/docs/android/setup#add-config-file" target="_blank">`Firebase documentation`</a>. Check <a href="https://github.com/infobip/mobile-messaging-react-native-plugin/wiki/Applying-Firebase-configuration-in-MobileMessaging-SDK">Applying Firebase configuration in MobileMessaging SDK Guide</a> for alternatives.

     > ### Notice (when targeting Android 13):
     >  Starting from Android 13, Google requires to ask user for notification permission. Follow [this guide](https://github.com/infobip/mobile-messaging-react-native-plugin/wiki/Android-13-Notification-Permission-Handling) to make a permission request.
       

## Initialization configuration

Initialize Mobile Messaging React Native plugin, provide application configuration in init method:

```javascript
import { mobileMessaging } from 'infobip-mobile-messaging-react-native-plugin';

someMethod(): void {
   ...

           mobileMessaging.init(
                   {
                      applicationCode: '<your app code>',
                      ios: {
                         notificationTypes: ['alert', 'badge', 'sound'],
                      },
                   },
                   () => {
                      console.log('MobileMessaging started');
                   },
                   error => {
                      console.log('MobileMessaging error: ', error);
                   },
           );
}
```
<details><summary>expand to see TypeScript code</summary>
<p>

```typescript
import { mobileMessaging } from 'infobip-mobile-messaging-react-native-plugin';

someMethod(): void {
   ...

           mobileMessaging.init(
                   {
                      applicationCode: '<your app code>',
                      ios: {
                         notificationTypes: ['alert', 'badge', 'sound'],
                      },
                   },
                   () => {
                      console.log('MobileMessaging started');
                   },
                   (error: MobileMessagingError) => {
                      console.log('MobileMessaging error: ', error);
                   },
           );
}
```

</p>
</details>

#### More details on SDK features and FAQ you can find on [Wiki](https://github.com/infobip/mobile-messaging-react-native-plugin/wiki)

<br>
<p align="center"><b>NEXT STEPS: <a href="https://github.com/infobip/mobile-messaging-react-native-plugin/wiki/Users-and-installations">Users and installations</a></b></p>
<br>

| If you have any questions or suggestions, feel free to send an email to support@infobip.com or create an <a href="https://github.com/infobip/mobile-messaging-react-native-plugin/issues" target="_blank">issue</a>. |
|---|
