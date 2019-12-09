//
//  MobileMessagingManagerSwiftBridge.m
//  ReactNativeMobileMessaging
//
//  Created by Andrey Kadochnikov on 29.11.2019.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "React/RCTBridgeModule.h"

@interface RCT_EXTERN_MODULE(ReactNativeMobileMessaging, NSObject)
RCT_EXTERN_METHOD(start)
RCT_EXTERN_METHOD(currentTime: (RCTResponseSenderBlock)callback)
@end
