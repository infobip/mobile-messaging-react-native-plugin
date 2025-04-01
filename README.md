# Mobile Messaging SDK plugin for React Native

[![npm](https://img.shields.io/npm/v/infobip-mobile-messaging-react-native-plugin.svg)](https://www.npmjs.com/package/infobip-mobile-messaging-react-native-plugin)

Mobile Messaging SDK is designed and developed to easily enable push notification channel in your mobile application. In almost no time of implementation you get push notification in your application and access to the features of [Infobip IP Messaging Platform](https://www.infobip.com/en/products/mobile-app-messaging).
The document describes library integration steps for your React Native project.

* [Requirements](#requirements)
* [Quick start guide](#quick-start-guide)
* [Initialization configuration](#initialization-configuration)

## Requirements
- node (v20.16.0 or higher)
- ruby (2.7.8 or higher)
- React Native (v0.75.4)

For iOS project:
- Xcode and Command Line Tools (16.x)
- CocoaPods (v1.15.2)
- Minimum deployment target 13.0

For Android project:
- Android Studio (Ladybug | 2024.2.1)
- Gradle (v8.8)
- Supported API Levels: 21 (Android 5.0 - [Lollipop](https://developer.android.com/about/versions/lollipop)) - 35 ([Android 15.0](https://developer.android.com/about/versions/15))

## Quick start guide

This guide is designed to get you up and running with Mobile Messaging SDK plugin for React Native:

1. Make sure to [setup application at Infobip portal](https://www.infobip.com/docs/mobile-app-messaging/getting-started#create-and-enable-a-mobile-application-profile), if you haven't already.

2. Add MobileMessaging plugin to your project, run in terminal:
    ```bash
    $ npm install infobip-mobile-messaging-react-native-plugin
    ```
   TypeScript's definitions are included into npm package

3. Configure platforms

   - **iOS**
      > ### Notice
      > Starting from the [6.2.0](https://github.com/infobip/mobile-messaging-react-native-plugin/releases/tag/6.1.0) plugin version it's not mandatory to add `use_frameworks!` to the `Podfile`, check the [Migration guide](https://github.com/infobip/mobile-messaging-react-native-plugin/wiki/Migration-guides#migration-from-610-to-620-in-case-you-are-getting-rid-of-use_frameworks-in-the-podfile) if you want to get rid of it.
      1. Run `pod install` from `/ios` folder (installs Mobile Messaging native SDK)
      2. Import following header `#import <MobileMessaging/MobileMessagingPluginApplicationDelegate.h>` and add `[MobileMessagingPluginApplicationDelegate install];` into `/ios/<ProjectName>/AppDelegate.m` (this is required for OS callbacks such as `didRegisterForRemoteNotifications` to be intercepted by native MobileMessaging SDK)
       ```objective-c
           ...
           #import <MobileMessaging/MobileMessagingPluginApplicationDelegate.h>
     
           @implementation AppDelegate

           - (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
           {
               [MobileMessagingPluginApplicationDelegate install];
               ...
           }
           ...
       ```
      3. Configure your project to support Push Notification as described in item 2 of [iOS integration quick start guide](https://github.com/infobip/mobile-messaging-sdk-ios#quick-start-guide)
      4. [Integrate Notification Service Extension](https://github.com/infobip/mobile-messaging-react-native-plugin/wiki/Delivery-improvements-and-rich-content-notifications#setting-up-ios-part) into your app in order to obtain:
         - more accurate processing of messages and delivery stats
         - support of rich notifications on the lock screen
   - **Android**
      1. Following paths should be provided in .bash_profile
         ```sh
         export ANDROID_HOME=$HOME/Library/Android/sdk
         export PATH=$PATH:$ANDROID_HOME/emulator
         export PATH=$PATH:$ANDROID_HOME/tools
         export PATH=$PATH:$ANDROID_HOME/tools/bin
         export PATH=$PATH:$ANDROID_HOME/platform-tools
         ```
      2. Add 'com.google.gms:google-services' to `android/build.gradle` file
         ```groovy
         buildscript {
            ...
            dependencies {
                ...
               //GMS Gradle plugin
               classpath 'com.google.gms:google-services:4.3.10'
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

