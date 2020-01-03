//
//  MobileMessagingManagerSwiftBridge.m
//  ReactNativeMobileMessaging
//
//  Created by Andrey Kadochnikov on 29.11.2019.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface ReactNativeMobileMessaging : RCTEventEmitter
@end

@interface ReactNativeMobileMessaging (RCTExternModule) <RCTBridgeModule>
@end

@implementation ReactNativeMobileMessaging(RCTExternModule)
RCT_EXPORT_MODULE_NO_LOAD(ReactNativeMobileMessaging, ReactNativeMobileMessaging)

RCT_EXTERN_METHOD(init:(NSDictionary *)config onSuccess:(RCTResponseSenderBlock)successCallback onError:(RCTResponseSenderBlock)errorCallback)

- (NSArray<NSString *> *)supportedEvents
{
  return @[
      @"tokenReceived",
      @"registrationUpdated",
      @"installationUpdated",
      @"userUpdated",
      @"personalized",
      @"depersonalized",
      @"geofenceEntered",
      @"actionTapped",
      @"notificationTapped",
      @"messageReceived"
  ];
}

- (void)calendarEventReminderReceived
{
  [self sendEventWithName:@"tokenReceived" body:@{}];
}

@end

//@interface RCT_EXTERN_MODULE(ReactNativeMobileMessaging, RCTEventEmitter)
//RCT_EXTERN_METHOD(init:(NSDictionary *)config onSuccess:(RCTResponseSenderBlock)successCallback onError:(RCTResponseSenderBlock)errorCallback)
//
//- (NSArray<NSString *> *)supportedEvents
//{
//  return @[@"tokenReceived"];
//}
//
//@end

//@interface RCT_EXTERN_MODULE(ReactNativeMobileMessaging, NSObject)
//RCT_EXTERN_METHOD(init:(NSDictionary *)config)
//@end

