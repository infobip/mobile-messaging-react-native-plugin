# Mobile Messaging SDK plugin for React Native

[![npm](https://img.shields.io/npm/v/infobip-mobile-messaging-react-native-plugin.svg)](https://www.npmjs.com/package/infobip-mobile-messaging-react-native-plugin)

Mobile Messaging SDK is designed and developed to easily enable push notification channel in your mobile application. In almost no time of implementation you get push notification in your application and access to the features of [Infobip IP Messaging Platform](https://portal.infobip.com/push/). 
The document describes library integration steps for your React Native project.

* [Requirements](#requirements)
* [Quick start guide](#quick-start-guide)
* [Initialization configuration](#initialization-configuration)

## Requirements
- node (v10.17.0 or higher)
- watchman (v4.9.0 or higher)
- React Native (v0.61.5)

For iOS project:
- Xcode and Command Line Tools (v11.2.1)
- CocoaPods (v1.6.1)
- Minimum deployment target 9.0

For Android project:
- Android Studio (v3.5.3)
- API Level: 16 (Android 4.1 - Jelly Bean)

## Quick start guide

This guide is designed to get you up and running with Mobile Messaging SDK plugin for React Native:

1. Make sure to [setup application at Infobip portal](https://www.infobip.com/docs/mobile-app-messaging/create-mobile-application-profile), if you haven't already.

2. Add MobileMessaging plugin to your project, run in terminal:
    ```bash
    $ npm install infobip-mobile-messaging-react-native-plugin
    ```

3. Configure platforms

    - **iOS**
        1. Add `use_frameworks!` into `/ios/Podfile` (required for Swift frameworks such as our Mobile Messaging SDK)
        2. Run `pod install` from `/ios` folder (installs Mobile Messaging native SDK)
        3. Import MobileMessaging `@import MobileMessaging;` and add `[MobileMessagingPluginApplicationDelegate install];` into `/ios/<ProjectName>/AppDelegate.m` (this is required for OS callbacks such as `didRegisterForRemoteNotifications` to be intercepted by native MobileMessaging SDK)
        ```objective-c
            ...
            @import MobileMessaging;
      
            @implementation AppDelegate

            - (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
            {
                [MobileMessagingPluginApplicationDelegate install];
                ...
            }
            ...
        ```
        4. Configure your project to support Push Notification as described in item 2 of [iOS integration quick start guide](https://github.com/infobip/mobile-messaging-sdk-ios#quick-start-guide)
        5. [Integrate Notification Service Extension](https://github.com/infobip/mobile-messaging-sdk-ios/wiki/Notification-Service-Extension-for-Rich-Notifications-and-better-delivery-reporting-on-iOS-10) into your app in order to obtain:
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
        2. Add [Firebase Sender Id](https://www.infobip.com/docs/mobile-app-messaging/fcm-server-api-key-setup-guide) to the `/android/app/src/main/res/values/strings.xml`
        ```xml
        <resources>
            ...
            <string name="google_app_id">your google app id</string>
        </resources>
        ```

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

#### More details on SDK features and FAQ you can find on [Wiki](https://github.com/infobip/mobile-messaging-react-native-plugin/wiki)

<br>
<p align="center"><b>NEXT STEPS: <a href="https://github.com/infobip/mobile-messaging-react-native-plugin/wiki/User-profile">User profile</a></b></p>
<br>

| If you have any questions or suggestions, feel free to send an email to support@infobip.com or create an <a href="https://github.com/infobip/mobile-messaging-react-native-plugin/issues" target="_blank">issue</a>. |
|---|

