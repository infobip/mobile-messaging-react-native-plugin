//
//  RNMMChatCustomization.swift
//  MobileMessagingReactNative
//
//  Copyright (c) 2016-2025 Infobip Limited
//  Licensed under the Apache License, Version 2.0
//

import Foundation
import UIKit
import MobileMessaging

enum ToolbarCustomizationKeys: String {
    case titleTextAppearance = "titleTextAppearance"
    case titleTextColor = "titleTextColor"
    case titleText = "titleText"
    case backgroundColor = "backgroundColor"
    case navigationIcon = "navigationIcon"
    case navigationIconTint = "navigationIconTint"

    func getString(from settings: [String: AnyObject]) -> String? {
        return settings[self.rawValue] as? String
    }

    func getImage(from settings: [String: AnyObject]) -> UIImage? {
        guard let uri = settings[self.rawValue] as? String else { return nil }
        guard let url = URL(string: uri) else { return nil }
        guard let data = try? Data(contentsOf: url) else { return nil }
        return UIImage(data: data)
    }

    func getColor(from settings: [String: AnyObject]) -> UIColor? {
        guard let colorHexString = getString(from: settings) else { return nil }
        return UIColor(hexString: colorHexString)
    }
}

enum ChatCustomizationKeys: String {
    case chatStatusBarBackgroundColor,
    chatStatusBarIconsColorMode,
    chatToolbar,
    attachmentPreviewToolbar,
    attachmentPreviewToolbarMenuItemsIconTint,
    attachmentPreviewToolbarSaveMenuItemIcon,
    chatBackgroundColor,
    chatProgressBarColor,
    chatInputTextAppearance,
    chatInputTextColor,
    chatInputBackgroundColor,
    chatInputHintText,
    chatInputHintTextColor,
    chatInputAttachmentIcon,
    chatInputAttachmentIconTint,
    chatInputAttachmentBackgroundDrawable,
    chatInputAttachmentBackgroundColor,
    chatInputSendIcon,
    chatInputSendIconTint,
    chatInputSendBackgroundDrawable,
    chatInputSendBackgroundColor,
    chatInputSeparatorLineColor,
    chatInputSeparatorLineVisible,
    chatInputCursorColor,
    chatInputCharCounterTextAppearance,
    chatInputCharCounterDefaultColor,
    chatInputCharCounterAlertColor,
    networkErrorTextColor,
    networkErrorLabelBackgroundColor,
    chatBannerErrorTextColor,
    chatBannerErrorBackgroundColor,
    chatBannerErrorIcon,
    chatBannerErrorIconTint,
    chatFullScreenErrorTitleText,
    chatFullScreenErrorTitleTextColor,
    chatFullScreenErrorDescriptionText,
    chatFullScreenErrorDescriptionTextColor,
    chatFullScreenErrorBackgroundColor,
    chatFullScreenErrorIcon

    func getDict(from settings: [String: AnyObject]) -> [String: AnyObject]? {
        return settings[self.rawValue] as? [String: AnyObject]
    }

    func getString(from settings: [String: AnyObject]) -> String? {
        return settings[self.rawValue] as? String
    }

    func getImage(from settings: [String: AnyObject]) -> UIImage? {
        guard let uri = settings[self.rawValue] as? String else { return nil }
        guard let url = URL(string: uri) else { return nil }
        guard let data = try? Data(contentsOf: url) else { return nil }
        return UIImage(data: data)
    }

    func getColor(from settings: [String: AnyObject]) -> UIColor? {
        guard let colorHexString = getString(from: settings) else { return nil }
        return UIColor(hexString: colorHexString)
    }

    func getBool(from settings: [String: AnyObject]) -> Bool? {
        guard let value = settings[self.rawValue] else { return nil }
        return value as? Bool
    }
}

extension UIColor {
    convenience init(hexString: String, alpha: CGFloat = 1.0) {
        let hexString: String = hexString.trimmingCharacters(in: CharacterSet.whitespacesAndNewlines)
        let scanner = Scanner(string: hexString)
        if (hexString.hasPrefix("#")) {
            scanner.currentIndex =  scanner.string.index(after: scanner.currentIndex)
        }
        var color: UInt64 = 0
        scanner.scanHexInt64(&color)
        let mask = 0x000000FF
        let r = Int(color >> 16) & mask
        let g = Int(color >> 8) & mask
        let b = Int(color) & mask
        let red   = CGFloat(r) / 255.0
        let green = CGFloat(g) / 255.0
        let blue  = CGFloat(b) / 255.0
        self.init(red:red, green:green, blue:blue, alpha:alpha)
    }
}
