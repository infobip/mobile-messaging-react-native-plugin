import {type TurboModule, TurboModuleRegistry} from 'react-native';

export interface Spec extends TurboModule {
    enableCalls(identity: string, onSuccess: () => void, onError: (error: Object) => void): void;
    enableChatCalls(onSuccess: () => void, onError: (error: Object) => void): void;
    disableCalls(onSuccess: () => void, onError: (error: Object) => void): void;
}

export default TurboModuleRegistry.get<Spec>('RNMMWebRTCUI');