//
//  MessageDetailsSheet.tsx
//  MobileMessagingReactNative
//
//  Copyright (c) 2016-2026 Infobip Limited
//  Licensed under the Apache License, Version 2.0
//

import React, {useEffect, useRef, useState} from 'react';
import {
  Animated,
  Image,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {MobileMessagingReactNative} from 'infobip-mobile-messaging-react-native-plugin';
import Button from './Button';
import DetailRow from './DetailRow';
import JsonDetails from './JsonDetails';
import Colors from '../constants/Colors';

type Message = MobileMessagingReactNative.Message;

interface MessageDetailsSheetProps {
  /** The sheet is open while a message is set. */
  message?: Message;
  time: string;
  onClose: () => void;
  onMarkSeen: (messageId: string) => void;
  onDelete: (messageId: string) => void;
  /** Set while another delete is running, so this one is not silently dropped. */
  deleteDisabled?: boolean;
}

function getLinks(message: Message): {label: string; url: string}[] {
  return [
    {label: 'Open deeplink', url: message.deeplink},
    {label: 'Open web view URL', url: message.webViewUrl},
    {label: 'Open browser URL', url: message.browserUrl},
  ].filter((link): link is {label: string; url: string} => Boolean(link.url));
}

/**
 * Bottom sheet with the whole message: image, full text, links, custom payload and the raw SDK object.
 * Mark as seen and Delete close the sheet, so their result shows on the screen behind it.
 */
const MessageDetailsSheet: React.FC<MessageDetailsSheetProps> = ({
  message,
  time,
  onClose,
  onMarkSeen,
  onDelete,
  deleteDisabled = false,
}) => {
  const {bottom: bottomInset} = useSafeAreaInsets();
  const slide = useRef(new Animated.Value(0)).current;
  const [linkError, setLinkError] = useState<string>();
  const messageId = message?.messageId;

  useEffect(() => {
    setLinkError(undefined);
    if (messageId) {
      slide.setValue(0);
      Animated.timing(slide, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }).start();
    }
  }, [messageId, slide]);

  const openLink = (url: string) => {
    setLinkError(undefined);
    Linking.openURL(url).catch(() => setLinkError(`Cannot open ${url}`));
  };

  return (
    <Modal
      visible={Boolean(message)}
      transparent
      animationType="fade"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}>
      <Pressable
        style={styles.backdrop}
        onPress={onClose}
        accessibilityLabel="Close message details"
      />
      {message ? (
        <Animated.View
          style={[
            styles.sheet,
            {
              paddingBottom: 16 + bottomInset,
              transform: [
                {
                  translateY: slide.interpolate({
                    inputRange: [0, 1],
                    outputRange: [400, 0],
                  }),
                },
              ],
            },
          ]}>
          <View style={styles.handle} />
          <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.title} selectable>
              {message.title || '(No title)'}
            </Text>
            <View style={styles.meta}>
              <Text style={styles.time}>{time}</Text>
              <Text
                style={[
                  styles.status,
                  message.seen ? styles.seenStatus : styles.unreadStatus,
                ]}>
                {message.seen ? 'Seen' : 'Unread'}
              </Text>
            </View>
            {message.contentUrl ? (
              <Image
                source={{uri: message.contentUrl}}
                style={styles.image}
                resizeMode="cover"
                accessibilityIgnoresInvertColors
              />
            ) : null}
            {message.body ? (
              <Text style={styles.body} selectable>
                {message.body}
              </Text>
            ) : null}
            {getLinks(message).map(link => (
              <Button
                key={link.label}
                variant="secondary"
                title={link.label}
                onPress={() => openLink(link.url)}
              />
            ))}
            {linkError ? (
              <Text style={styles.linkError}>{linkError}</Text>
            ) : null}
            <View style={styles.details}>
              <DetailRow
                label="Message ID"
                value={message.messageId}
                copyable
              />
              {message.topic ? (
                <DetailRow label="Topic" value={message.topic} />
              ) : null}
            </View>
            {message.customPayload &&
            Object.keys(message.customPayload).length ? (
              <JsonDetails
                value={message.customPayload}
                label="custom payload"
              />
            ) : null}
            <JsonDetails value={message} />
          </ScrollView>
          <View style={styles.actions}>
            {message.seen ? null : (
              <View style={styles.action}>
                <Button
                  variant="secondary"
                  title="Mark as seen"
                  onPress={() => {
                    onClose();
                    onMarkSeen(message.messageId);
                  }}
                />
              </View>
            )}
            <View style={styles.action}>
              <Button
                variant="dangerSecondary"
                title="Delete"
                disabled={deleteDisabled}
                onPress={() => {
                  onClose();
                  onDelete(message.messageId);
                }}
              />
            </View>
          </View>
        </Animated.View>
      ) : null}
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(27, 27, 26, 0.45)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: '85%',
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    marginTop: 8,
    backgroundColor: Colors.border,
  },
  content: {
    padding: 20,
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  time: {
    fontSize: 13,
    color: Colors.textTertiary,
  },
  status: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden',
  },
  seenStatus: {
    color: Colors.textSecondary,
    backgroundColor: Colors.surfaceMuted,
  },
  unreadStatus: {
    color: Colors.infoText,
    backgroundColor: Colors.infoSubdued,
  },
  image: {
    width: '100%',
    aspectRatio: 2,
    borderRadius: 8,
    backgroundColor: Colors.surfaceMuted,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.textPrimary,
  },
  linkError: {
    fontSize: 13,
    color: Colors.dangerText,
  },
  details: {
    gap: 8,
    paddingTop: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
  },
  action: {
    flex: 1,
  },
});

export default MessageDetailsSheet;
