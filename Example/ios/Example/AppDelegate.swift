import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
import MobileMessaging

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
  var window: UIWindow?


  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    MobileMessagingPluginApplicationDelegate.install();

    // Set the message handling delegate to display notifications in foreground
    MobileMessaging.messageHandlingDelegate = MyMessageHandlingDelegate()

    return true
  }
  
  // MARK: UISceneSession Lifecycle

  func application(_ application: UIApplication, configurationForConnecting connectingSceneSession: UISceneSession, options: UIScene.ConnectionOptions) -> UISceneConfiguration {
      // Called when a new scene session is being created.
      // Use this method to select a configuration to create the new scene with.
      return UISceneConfiguration(name: "Default Configuration", sessionRole: connectingSceneSession.role)
  }

  func application(_ application: UIApplication, didDiscardSceneSessions sceneSessions: Set<UISceneSession>) {
      // Called when the user discards a scene session.
      // If any sessions were discarded while the application was not running, this will be called shortly after application:didFinishLaunchingWithOptions.
      // Use this method to release any resources that were specific to the discarded scenes, as they will not return.
  }
}

class MyMessageHandlingDelegate: NSObject, MMMessageHandlingDelegate {
    func willPresentInForeground(message: MM_MTMessage?, notification: UNNotification, withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {
        if #available(iOS 14.0, *) {
            completionHandler([.banner, .sound, .badge])
        } else {
            completionHandler([.alert, .sound, .badge])
        }
    }
}

