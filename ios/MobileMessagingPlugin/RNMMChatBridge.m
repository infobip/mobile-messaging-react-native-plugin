//
//  RNMMChatBridge.m
//  infobip-mobile-messaging-react-native-plugin
//
//  Created by Olga Koroleva on 26.05.2020.
//

#import <React/RCTBridgeModule.h>
#import <React/RCTViewManager.h>

@interface RNMMChat : NSObject
@end

@interface RNMMChat (RCTExternModule) <RCTBridgeModule>
@end

@implementation RNMMChat (RCTExternModule)
RCT_EXPORT_MODULE_NO_LOAD(RNMMChat, RNMMChat)
RCT_EXTERN_METHOD(showChat:)
RCT_EXTERN_METHOD(getMessageCounter:(RCTResponseSenderBlock)resultCallback)
RCT_EXTERN_METHOD(resetMessageCounter)
RCT_EXTERN_METHOD(setupChatSettings:)
RCT_EXTERN_METHOD(setLanguage:)
RCT_EXTERN_METHOD(sendContextualData:(NSString *)data multiThreadStrategy:(BOOL)multiThreadStrategy onSuccess:(RCTResponseSenderBlock)successCallback onError:(RCTResponseSenderBlock)errorCallback)
RCT_EXTERN_METHOD(showThreadsList)

- (dispatch_queue_t)methodQueue {
   return dispatch_get_main_queue();
}

+ (BOOL)requiresMainQueueSetup {
    return true;
}
@end
