//
//  MobileMessagingManagerSwiftBridge.m
//  ReactNativeMobileMessaging
//
//  Created by Andrey Kadochnikov on 29.11.2019.
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

/*User Profile Management*/
RCT_EXTERN_METHOD(saveUser:(NSDictionary *)userData onSuccess:(RCTResponseSenderBlock)successCallback onError:(RCTResponseErrorBlock)errorCallback)
RCT_EXTERN_METHOD(fetchUser:(RCTResponseSenderBlock)successCallback onError:(RCTResponseErrorBlock)errorCallback)
RCT_EXTERN_METHOD(getUser:(RCTResponseSenderBlock)successCallback)
RCT_EXTERN_METHOD(saveInstallation:(NSDictionary *)installation onSuccess:(RCTResponseSenderBlock)successCallback onError:(RCTResponseErrorBlock)errorCallback)
RCT_EXTERN_METHOD(fetchInstallation:(RCTResponseSenderBlock)successCallback onError:(RCTResponseErrorBlock)errorCallback)
RCT_EXTERN_METHOD(getInstallation:(RCTResponseSenderBlock)successCallback)
RCT_EXTERN_METHOD(setInstallationAsPrimary:(NSString *)pushRegistrationId primary:(BOOL)primary onSuccess:(RCTResponseSenderBlock)successCallback onError:(RCTResponseErrorBlock)errorCallback)
RCT_EXTERN_METHOD(personalize:(NSDictionary *)context onSuccess:(RCTResponseSenderBlock)successCallback onError:(RCTResponseErrorBlock)errorCallback)
RCT_EXTERN_METHOD(depersonalize:(RCTResponseSenderBlock)successCallback onError:(RCTResponseErrorBlock)errorCallback)
RCT_EXTERN_METHOD(depersonalizeInstallation:(NSString *)pushRegistrationId onSuccess:(RCTResponseSenderBlock)successCallback onError:(RCTResponseErrorBlock)errorCallback)

/*Messages and Notifications*/
RCT_EXTERN_METHOD(markMessagesSeen:(NSArray *)messageIds onSuccess:(RCTResponseSenderBlock)successCallback onError:(RCTResponseErrorBlock)errorCallback)
RCT_EXTERN_METHOD(defaultMessageStorage_find:(NSString *)messageId onSuccess:(RCTResponseSenderBlock)successCallback onError:(RCTResponseErrorBlock)errorCallback)
RCT_EXTERN_METHOD(defaultMessageStorage_findAll:(RCTResponseSenderBlock)successCallback onError:(RCTResponseErrorBlock)errorCallback)
RCT_EXTERN_METHOD(defaultMessageStorage_delete:(NSString *)messageId onSuccess:(RCTResponseSenderBlock)successCallback onError:(RCTResponseErrorBlock)errorCallback)
RCT_EXTERN_METHOD(defaultMessageStorage_deleteAll:(RCTResponseSenderBlock)successCallback onError:(RCTResponseErrorBlock)errorCallback)


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

@end

