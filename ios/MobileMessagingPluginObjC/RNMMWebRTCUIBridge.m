//
//  RNMMWebRTCUIBridge.m
//  MobileMessagingReactNative
//
//  Copyright (c) 2016-2025 Infobip Limited
//  Licensed under the Apache License, Version 2.0
//

#import <React/RCTBridgeModule.h>
#import <React/RCTViewManager.h>

@interface RNMMWebRTCUI : NSObject
@end

@interface RNMMWebRTCUI (RCTExternModule) <RCTBridgeModule>
@end

@implementation RNMMWebRTCUI (RCTExternModule)
RCT_EXPORT_MODULE_NO_LOAD(RNMMWebRTCUI, RNMMWebRTCUI)
RCT_EXTERN_METHOD(enableCalls:(NSString *)identity onSuccess:(RCTResponseSenderBlock)successCallback onError:(RCTResponseSenderBlock)errorCallback)
RCT_EXTERN_METHOD(enableChatCalls:(RCTResponseSenderBlock)successCallback onError:(RCTResponseSenderBlock)errorCallback)
RCT_EXTERN_METHOD(disableCalls:(RCTResponseSenderBlock)successCallback onError:(RCTResponseSenderBlock)errorCallback)


- (dispatch_queue_t)methodQueue {
   return dispatch_get_main_queue();
}

+ (BOOL)requiresMainQueueSetup {
    return true;
}
@end
