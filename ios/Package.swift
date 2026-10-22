// swift-tools-version: 5.9
//
//  Package.swift
//  InfobipMobileMessagingReactNativePlugin
//
//  Copyright (c) 2016-2025 Infobip Limited
//  Licensed under the Apache License, Version 2.0
//

import PackageDescription
import Foundation

private let iOSMMVersion: Version = "15.7.7"

private let webRTCUIEnabled: Bool = {
    let appPackageJSON = URL(fileURLWithPath: Context.packageDirectory)
        .appendingPathComponent("../../../../../../package.json")
        .standardized
    guard let data = try? Data(contentsOf: appPackageJSON),
          let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
          let config = json["infobipMobileMessaging"] as? [String: Any] else {
        return false
    }
    return config["webRTCUI"] as? Bool ?? false
}()

private let reactDependencies: [Target.Dependency] = [
    .product(name: "ReactHeaders", package: "ReactNative"),
    .product(name: "ReactNativeHeaders", package: "ReactNative"),
    .product(name: "ReactNativeDependenciesHeaders", package: "ReactNative"),
    .product(name: "ReactAppHeaders", package: "React-GeneratedCode"),
]

private let mmDependencies: [Target.Dependency] = [
    .product(name: "MobileMessaging", package: "mobile-messaging-sdk-ios"),
    .product(name: "InAppChat", package: "mobile-messaging-sdk-ios"),
    .product(name: "MobileMessagingInbox", package: "mobile-messaging-sdk-ios"),
    .product(name: "MobileMessagingLogging", package: "mobile-messaging-sdk-ios")
] + (webRTCUIEnabled ? [.product(name: "WebRTCUI", package: "mobile-messaging-sdk-ios")] : [])

let package = Package(
    name: "InfobipMobileMessagingReactNativePlugin",
    platforms: [.iOS(.v15)],
    products: [
        .library(
            name: "InfobipMobileMessagingReactNativePlugin",
            targets: [
                "MobileMessagingReactNative",
                "MobileMessagingReactNativeBridge"
            ]
        )
    ],
    dependencies: [
        .package(name: "ReactNative", path: "../../../../xcframeworks"),
        .package(name: "React-GeneratedCode", path: "../../../ios"),
        .package(
            url: "https://github.com/infobip/mobile-messaging-sdk-ios.git",
            exact: iOSMMVersion
        ),
    ],
    targets: [
        .target(
            name: "MobileMessagingReactNative",
            dependencies: mmDependencies + reactDependencies,
            path: "MobileMessagingPlugin",
            swiftSettings: webRTCUIEnabled ? [.define("WEBRTCUI_ENABLED")] : []
        ),
        .target(
            name: "MobileMessagingReactNativeBridge",
            dependencies: reactDependencies,
            path: "MobileMessagingPluginObjC",
            publicHeadersPath: "."
        )
    ]
)