import {type TurboModule, TurboModuleRegistry} from 'react-native';

export interface Spec extends TurboModule {
    showChat(args: {[key: string]: string}): void;
    showThreadsList(): void;
    getMessageCounter(onSuccess: (count: number) => void): void;
    resetMessageCounter(): void;
    setLanguage(localeString: string, onSuccess: (lang: string) => void, onError: (error: Object) => void): void;
    sendContextualData(data: string, multithreadStrategyFlag: string, onSuccess: () => void, onError: (error: Object) => void): void;
    setWidgetTheme(widgetTheme: string | null): void;
    setChatCustomization(map: {[key: string]: string} | null): void;
    setChatPushTitle(title: string | null): void;
    setChatPushBody(body: string | null): void;
    restartConnection(): void;
    stopConnection(): void;
    setChatJwtProvider(): void;
    setChatJwt(jwt: string | null): void;
    setChatExceptionHandler(isHandlerPresent: boolean): void;
}

export default TurboModuleRegistry.getEnforcing<Spec>('RNMMChat');
