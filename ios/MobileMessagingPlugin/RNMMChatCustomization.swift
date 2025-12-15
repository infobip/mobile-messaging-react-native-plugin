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
    case chatStatusBarBackgroundColor = "chatStatusBarBackgroundColor"
    case chatStatusBarIconsColorMode = "chatStatusBarIconsColorMode"
    case chatToolbar = "chatToolbar"
    case attachmentPreviewToolbar = "attachmentPreviewToolbar"
    case attachmentPreviewToolbarMenuItemsIconTint = "attachmentPreviewToolbarMenuItemsIconTint"
    case attachmentPreviewToolbarSaveMenuItemIcon = "attachmentPreviewToolbarSaveMenuItemIcon"
    case networkErrorText = "networkErrorText"
    case networkErrorTextColor = "networkErrorTextColor"
    case networkErrorTextAppearance = "networkErrorTextAppearance"
    case networkErrorLabelBackgroundColor = "networkErrorLabelBackgroundColor"
    case chatBackgroundColor = "chatBackgroundColor"
    case chatProgressBarColor = "chatProgressBarColor"
    case chatInputTextAppearance = "chatInputTextAppearance"
    case chatInputTextColor = "chatInputTextColor"
    case chatInputBackgroundColor = "chatInputBackgroundColor"
    case chatInputHintText = "chatInputHintText"
    case chatInputHintTextColor = "chatInputHintTextColor"
    case chatInputAttachmentIcon = "chatInputAttachmentIcon"
    case chatInputAttachmentIconTint = "chatInputAttachmentIconTint"
    case chatInputAttachmentBackgroundDrawable = "chatInputAttachmentBackgroundDrawable"
    case chatInputAttachmentBackgroundColor = "chatInputAttachmentBackgroundColor"
    case chatInputSendIcon = "chatInputSendIcon"
    case chatInputSendIconTint = "chatInputSendIconTint"
    case chatInputSendBackgroundDrawable = "chatInputSendBackgroundDrawable"
    case chatInputSendBackgroundColor = "chatInputSendBackgroundColor"
    case chatInputSeparatorLineColor = "chatInputSeparatorLineColor"
    case chatInputSeparatorLineVisible = " chatInputSeparatorLineVisible"
    case chatInputCursorColor = "chatInputCursorColor"
    case chatInputCharCounterTextAppearance = "chatInputCharCounterTextAppearance"
    case chatInputCharCounterDefaultColor = "chatInputCharCounterDefaultColor"
    case chatInputCharCounterAlertColor = "chatInputCharCounterAlertColor"

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

// Deprecated in favour of ChatCustomizationKeys
enum CustomizationKeys: String {
    // MARK: Common Settings
    case toolbarTitle = "toolbarTitle"

    case sendButtonTintColor = "sendButtonTintColor"
    case toolbarTintColor = "toolbarTintColor"
    case toolbarBackgroundColor = "toolbarBackgroundColor"
    case toolbarTitleColor = "toolbarTitleColor"
    
    case chatBackgroundColor = "chatBackgroundColor"
    case noConnectionAlertTextColor = "noConnectionAlertTextColor"
    case noConnectionAlertBackgroundColor = "noConnectionAlertBackgroundColor"
    case chatInputPlaceholderTextColor = "chatInputPlaceholderTextColor"
    case chatInputCursorColor = "chatInputCursorColor"
    case widgetTheme = "widgetTheme"
    case inputTextColor = "inputTextColor"
    /// Icons
    case sendButtonIcon = "sendButtonIconUri"
    case attachmentButtonIcon = "attachmentButtonIconUri"
    
    case chatInputSeparatorVisible = "chatInputSeparatorVisible"
    // MARK: Platform specific settings
    case attachmentPreviewBarsColor = "attachmentPreviewBarsColor"
    case attachmentPreviewItemsColor = "attachmentPreviewItemsColor"
    /// Sizes
    case textContainerTopMargin = "textContainerTopMargin"
    case textContainerLeftPadding = "textContainerLeftPadding"
    case textContainerCornerRadius = "textContainerCornerRadius"
    case textViewTopMargin = "textViewTopMargin"
    case placeholderHeight = "placeholderHeight"
    case placeholderSideMargin = "placeholderSideMargin"
    case buttonHeight = "buttonHeight"
    case buttonTouchableOverlap = "buttonTouchableOverlap"
    case buttonRightMargin = "buttonRightMargin"
    case utilityButtonWidth = "utilityButtonWidth"
    case utilityButtonBottomMargin = "utilityButtonBottomMargin"
    case initialHeight = "initialHeight"
    /// Fonts
    case mainFont = "mainFont"
    case chatCountFont = "chatCountFont"
    
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
    
    func getCGFloat(from settings: [String: AnyObject]) -> CGFloat? {
        guard let number = settings[self.rawValue] as? NSNumber else { return nil}
        return CGFloat(truncating: number)
    }
    
    func getBool(from settings: [String: AnyObject]) -> Bool? {
        guard let value = settings[self.rawValue] else { return nil }
        return value as? Bool
    }
    
    func getFont(from settings: [String: AnyObject], with size: CGFloat) -> UIFont? {
        guard let fontName = getString(from: settings) else { return nil }
        return UIFont(name: fontName, size: size)
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
