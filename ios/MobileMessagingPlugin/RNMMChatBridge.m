//
//  RNMMChatBridge.m
//  MobileMessagingReactNative
//
//  Copyright (c) 2016-2025 Infobip Limited
//  Licensed under the Apache License, Version 2.0
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
RCT_EXTERN_METHOD(setWidgetTheme:)
RCT_EXTERN_METHOD(setChatCustomization:)
RCT_EXTERN_METHOD(setLanguage:(NSString *)data onSuccess:(RCTResponseSenderBlock)successCallback onError:(RCTResponseSenderBlock)errorCallback)
RCT_EXTERN_METHOD(setChatJwt:)
RCT_EXTERN_METHOD(setChatJwtProvider)
RCT_EXTERN_METHOD(setChatExceptionHandler:)
RCT_EXTERN_METHOD(sendContextualData:(NSString *)data chatMultiThreadStrategy:(NSString *)chatMultiThreadStrategy onSuccess:(RCTResponseSenderBlock)successCallback onError:(RCTResponseSenderBlock)errorCallback)
RCT_EXTERN_METHOD(showThreadsList)
RCT_EXTERN_METHOD(restartConnection)
RCT_EXTERN_METHOD(stopConnection)

- (dispatch_queue_t)methodQueue {
   return dispatch_get_main_queue();
}

+ (BOOL)requiresMainQueueSetup {
    return true;
}
@end
