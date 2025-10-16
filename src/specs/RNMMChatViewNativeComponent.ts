/**
 * RNMMChatView
 *
 * React Native Fabric (Codegen) native component declaration for the Infobip ChatView.
 */
import type {HostComponent, ViewProps} from 'react-native';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import codegenNativeCommands from 'react-native/Libraries/Utilities/codegenNativeCommands';

export interface NativeProps extends ViewProps {
  sendButtonColor?: string;
}

interface NativeCommands {
    add: (viewRef: React.ElementRef<HostComponent<NativeProps>>) => void;
    remove: (viewRef: React.ElementRef<HostComponent<NativeProps>>) => void;
    setExceptionHandler: (viewRef: React.ElementRef<HostComponent<NativeProps>>, isHandlerPresent: boolean) => void;
    showThreadsList: (viewRef: React.ElementRef<HostComponent<NativeProps>>) => void;
}

export const Commands: NativeCommands = codegenNativeCommands<NativeCommands>({
    supportedCommands: ['add', 'remove', 'setExceptionHandler', 'showThreadsList'],
});

export default codegenNativeComponent<NativeProps>(
  'RNMMChatView',
) as HostComponent<NativeProps>;