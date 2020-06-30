//
//  RNMMChatViewManagerBridge.m
//  infobip-mobile-messaging-react-native-plugin
//
//  Created by Olga Koroleva on 28.05.2020.
//

#import <Foundation/Foundation.h>
#import <React/RCTViewManager.h>

@interface RNMMChatViewManager: NSObject
@end

@interface RNMMChatViewManager (Module)
@end

@implementation RNMMChatViewManager  (Module)
RCT_EXPORT_MODULE_NO_LOAD(RNMMChatView, RNMMChatViewManager)
RCT_EXPORT_VIEW_PROPERTY(sendButtonColor, NSString *)

- (dispatch_queue_t)methodQueue {
   return dispatch_get_main_queue();
}

+ (BOOL)requiresMainQueueSetup {
    return true;
}
@end
