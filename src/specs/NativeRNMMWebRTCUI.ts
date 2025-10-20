//
//  NativeRNMMWebRTCUI.ts
//  MobileMessagingReactNative
//
//  Copyright (c) 2016-2025 Infobip Limited
//  Licensed under the Apache License, Version 2.0
//

import {type TurboModule, TurboModuleRegistry} from 'react-native';

export interface Spec extends TurboModule {
    enableCalls(identity: string, onSuccess: () => void, onError: (error: Object) => void): void;
    enableChatCalls(onSuccess: () => void, onError: (error: Object) => void): void;
    disableCalls(onSuccess: () => void, onError: (error: Object) => void): void;
}

export default TurboModuleRegistry.get<Spec>('RNMMWebRTCUI');