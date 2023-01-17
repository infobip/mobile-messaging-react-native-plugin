import PropTypes from 'prop-types';
import React, { FC, useLayoutEffect, useRef } from "react";
import codegenNativeCommands from 'react-native/Libraries/Utilities/codegenNativeCommands';
import {findNodeHandle, requireNativeComponent} from 'react-native'

interface RNMMChatViewProps {
    sendButtonColor: ?string
}

const RNMMChatViewCommands = codegenNativeCommands({
    supportedCommands: ["add", "remove"],
});

export const ChatView: FC<RNMMChatViewProps> = props => {
    const ref = useRef(null);

    useLayoutEffect(() => {
        // Not needed for iOS.
        if (Platform.OS === "ios") return;

        const chatViewRef = ref.current
        // Nothing to do if there is no chatView reference.
        if (!chatViewRef) return;

        let addedViewId: ?number = null

        // Fix for android, sometimes it can't get parent view, which is needed
        // for proper relayout.
        setTimeout(() => {
            const viewId = findNodeHandle(chatViewRef);
            if (viewId !== null && viewId !== undefined) {
                RNMMChatViewCommands.add(chatViewRef, viewId);
                console.log(`Adding android viewId: ${viewId}.`);
                addedViewId = viewId;
            }
        }, 100);

        return () => {
            const viewId = addedViewId
            if (viewId !== null && viewId !== undefined) {
                console.log(`Removing android viewId: ${viewId}.`);
                RNMMChatViewCommands.remove(chatViewRef, viewId);
            }
        };
    }, []);

    return <RNMMChatView {...props} ref={ref} />;
};

ChatView.propTypes = {
    /**
     * Send button color can be set in hex format.
     * If it's not provided, color from Infobip Portal widget configuration will be set.
     */
    sendButtonColor: PropTypes.string,
};

export const RNMMChatView = requireNativeComponent('RNMMChatView', ChatView);
