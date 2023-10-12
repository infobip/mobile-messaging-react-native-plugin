//
//  RNMMWebRTCUI.swift
//  infobip-mobile-messaging-react-native-plugin
//
//  Created by Francisco Fortes on 21.06.2022.
//

import Foundation
import MobileMessaging

@objc(RNMMWebRTCUI)
class RNMMWebRTCUI: NSObject {

#if WEBRTCUI_ENABLED
    private func handleCalls(
        _ identity: MMWebRTCIdentityMode,
        onSuccess: @escaping RCTResponseSenderBlock,
        onError: @escaping RCTResponseSenderBlock)
    {
        if let cachedConfigDict = RNMobileMessagingConfiguration.getRawConfigFromDefaults(),
           let configuration = RNMobileMessagingConfiguration(rawConfig: cachedConfigDict),
           let webRTCUI = configuration.webRTCUI,
            let webRTCId = webRTCUI[RNMobileMessagingConfiguration.Keys.configurationId] as? String {
            MobileMessaging.webRTCService?.configurationId = webRTCId
            MobileMessaging.webRTCService?.identityMode = identity
            MobileMessaging.webRTCService?.start({ result in
                switch result {
                case true:
                    MMLogDebug("[WebRTCUI] Request for enabling calls ended with success")
                    onSuccess(nil)
                case false:
                    MMLogError("[WebRTCUI] Request for enabling calls ended with failure - See further logs.")
                    onError(nil)
                }
            })
        } else {
            MMLogDebug("[WebRTCUI] WebRTC's configurationId not defined in the configuration, calls were not enabled.")
            onError([NSError(type: .InvalidArguments).reactNativeObject])
        }
    }
#endif

    @objc(enableCalls:onSuccess:onError:)
    func enableCalls(
        identity: String,
        onSuccess: @escaping RCTResponseSenderBlock,
        onError: @escaping RCTResponseSenderBlock)
    {
#if WEBRTCUI_ENABLED
        let identityMode: MMWebRTCIdentityMode = identity.isEmpty ? .default : .custom(identity)
        handleCalls(identityMode, onSuccess: onSuccess, onError: onError)
#else
        MMLogDebug("[WebRTCUI] Not imported properly in podfile: library cannot be used.")
        onError([NSError(type: .NotSupported).reactNativeObject])
#endif
    }

    @objc(enableChatCalls:onError:)
    func enableChatCalls(
        onSuccess: @escaping RCTResponseSenderBlock,
        onError: @escaping RCTResponseSenderBlock)
    {
#if WEBRTCUI_ENABLED
        handleCalls(.inAppChat, onSuccess: onSuccess, onError: onError)
#else
        MMLogDebug("[WebRTCUI] Not imported properly in podfile: library cannot be used.")
        onError([NSError(type: .NotSupported).reactNativeObject])
#endif
    }

    @objc(disableCalls:onError:)
    func disableCalls(
        onSuccess: @escaping RCTResponseSenderBlock,
        onError: @escaping RCTResponseSenderBlock)
    {
#if WEBRTCUI_ENABLED
        MobileMessaging.webRTCService?.stopService({ result in
            switch result {
            case true:
                MMLogDebug("[WebRTCUI] Request for disabling calls ended with success")
                onSuccess(nil)
            case false:
                MMLogError("[WebRTCUI] Request for disabling calls ended with failure - See further logs.")
                onError(nil)
            }
        })
#else
        MMLogError("[WebRTCUI] Not imported properly in podfile: library cannot be used")
        onError([NSError(type: .NotSupported).reactNativeObject])
#endif
    }
}
