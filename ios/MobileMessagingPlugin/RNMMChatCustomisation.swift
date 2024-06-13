//
//  RNMobileMessagingConfiguration.swift
//  infobip-mobile-messaging-react-native-plugin
//
//  Created by Maksym Svitlovskyi on 10.08.2023.
//

import Foundation
import UIKit
import MobileMessaging

enum CustomisationKeys: String {
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
            scanner.scanLocation = 1
        }
        var color: UInt32 = 0
        scanner.scanHexInt32(&color)
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
