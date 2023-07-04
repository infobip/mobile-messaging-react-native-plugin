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

    @objc(enableCalls:onError:)
    func enableCalls(onSuccess: @escaping RCTResponseSenderBlock, onError: @escaping RCTResponseSenderBlock) {
#if WEBRTCUI_ENABLED
        if let cachedConfigDict = RNMobileMessagingConfiguration.getRawConfigFromDefaults(),
           let configuration = RNMobileMessagingConfiguration(rawConfig: cachedConfigDict),
           let webRTCUI = configuration.webRTCUI,
            let webRTCId = webRTCUI[RNMobileMessagingConfiguration.Keys.applicationId] as? String {
            MobileMessaging.webRTCService?.applicationId = webRTCId
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
            MMLogDebug("[WebRTCUI] WebRTC's applicationId not defined in the configuration, calls were not enabled.")
            onError([NSError(type: .InvalidArguments).reactNativeObject])
        }

#else
        MMLogDebug("[WebRTCUI] Not imported properly in podfile: library cannot be used.")
        onError([NSError(type: .NotSupported).reactNativeObject])
#endif
    }

    @objc(disableCalls:onError:)
    func disableCalls(onSuccess: @escaping RCTResponseSenderBlock, onError: @escaping RCTResponseSenderBlock) {
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
