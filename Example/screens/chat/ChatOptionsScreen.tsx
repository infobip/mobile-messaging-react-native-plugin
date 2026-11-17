//
//  ChatOptionsScreen.tsx
//  MobileMessagingReactNative
//
//  Copyright (c) 2016-2026 Infobip Limited
//  Licensed under the Apache License, Version 2.0
//

import React, {useState} from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import {
  mobileMessaging,
  webRTCUI,
} from 'infobip-mobile-messaging-react-native-plugin';
import type {MobileMessagingReactNative} from 'infobip-mobile-messaging-react-native-plugin';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Notice from '../../components/Notice';
import ScreenContainer from '../../components/ScreenContainer';
import SwitchRow from '../../components/SwitchRow';
import TextField from '../../components/TextField';
import Colors from '../../constants/Colors';
import type {
  RootStackParamList,
  ScreenProps,
} from '../../constants/RootStackParamList';
import {SubjectType} from '../../constants/SubjectType';
import {errorFeedback} from '../../utils/feedback';
import type {Feedback} from '../../utils/feedback';
import {generateChatJWT} from '../../utils/JWTUtils';

type UserIdentity = MobileMessagingReactNative.UserIdentity;
type PersonalizeContext = MobileMessagingReactNative.PersonalizeContext;
type MobileMessagingError = MobileMessagingReactNative.MobileMessagingError;
type ChatViewScreenName = Extract<
  keyof RootStackParamList,
  'ChatViewScreen' | 'ChatViewCustomLayoutScreen' | 'ChatViewMultithreadScreen'
>;
type Section = 'person' | 'chat' | 'calls' | 'more';

/**
 * Live Chat widget ID.
 * Widget ID is used for generating JWT to be able use Chat as authenticated customer.
 * You can get your widget ID in widget configuration page.
 */
const LIVECHAT_WIDGET_ID = 'YOUR_LIVECHAT_WIDGET_ID';

/**
 * Widget secret key in JSON form.
 * Secret key is used for generating JWT to be able use Chat as authenticated customer.
 * You can generate new secret key following a guide https://www.infobip.com/docs/live-chat/user-types#enable-authenticated-customers.
 * Demo only: a production app gets chat tokens from its own backend and never ships the secret key.
 */
const LIVECHAT_SECRET_KEY_JSON = 'YOUR_LIVECHAT_SECRET_KEY_JSON';

const subjectTypes = [
  {label: 'External person ID', value: SubjectType.ExternalPersonId},
  {label: 'Phone number', value: SubjectType.PhoneNumber},
  {label: 'Email', value: SubjectType.Email},
];

const emptyForm = {
  firstName: '',
  lastName: '',
  subjectType: SubjectType.ExternalPersonId,
  subject: '',
  forceDepersonalize: true,
  keepAsLead: false,
};

function buildUserIdentity(
  subjectType: SubjectType,
  subject: string,
): UserIdentity {
  switch (subjectType) {
    case SubjectType.Email:
      return {emails: [subject]};
    case SubjectType.PhoneNumber:
      return {phones: [subject]};
    case SubjectType.ExternalPersonId:
      return {externalUserId: subject};
  }
}

const assetUri = (asset: number) => Image.resolveAssetSource(asset)?.uri ?? '';

function buildChatCustomization() {
  const sendButtonIcon = require('../../assets/ic_send.png');
  const attachmentIcon = require('../../assets/ic_add_circle.png');
  const navigationIcon = require('../../assets/ic_back.png');
  const downloadIcon = require('../../assets/ic_download.png');
  return {
    chatStatusBarBackgroundColor: '#673AB7',
    chatStatusBarIconsColorMode: 'dark',
    attachmentPreviewToolbarSaveMenuItemIcon: assetUri(downloadIcon),
    attachmentPreviewToolbarMenuItemsIconTint: '#9E9E9E',
    chatToolbar: {
      titleTextAppearance: 'TextAppearance_AppCompat_Title',
      titleTextColor: '#FFFFFF',
      titleText: 'Some new title',
      titleCentered: true,
      backgroundColor: '#673AB7',
      navigationIcon: assetUri(navigationIcon),
      navigationIconTint: '#FFFFFF',
      subtitleTextAppearance: 'TextAppearance_AppCompat_Subtitle',
      subtitleTextColor: '#FFFFFF',
      subtitleText: '#1',
      subtitleCentered: true,
    },
    attachmentPreviewToolbar: {
      titleTextAppearance: 'TextAppearance_AppCompat_Title',
      titleTextColor: '#212121',
      titleText: 'Attachment preview',
      titleCentered: true,
      backgroundColor: '#673AB7',
      navigationIcon: assetUri(navigationIcon),
      navigationIconTint: '#FFFFFF',
      subtitleTextAppearance: 'TextAppearance_AppCompat_Subtitle',
      subtitleTextColor: '#FFFFFF',
      subtitleText: 'Attachment preview subtitle',
      subtitleCentered: false,
    },
    networkErrorText: 'Network error',
    networkErrorTextColor: '#DE22FF',
    networkErrorTextAppearance: 'TextAppearance_AppCompat_Medium',
    networkErrorLabelBackgroundColor: '#3F51B5',
    networkErrorIconTint: '#FFC107', // android only
    chatFullScreenErrorTitleText: 'Oops! Something went wrong',
    chatFullScreenErrorTitleTextColor: '#E91E63',
    chatFullScreenErrorTitleTextAppearance: 'TextAppearance_AppCompat_Large',
    chatFullScreenErrorDescriptionText:
      'Please check your connection and try again',
    chatFullScreenErrorDescriptionTextColor: '#00BCD4',
    chatFullScreenErrorDescriptionTextAppearance:
      'TextAppearance_AppCompat_Body1',
    chatFullScreenErrorBackgroundColor: '#1B5E20',
    chatFullScreenErrorIconTint: '#FF9800',
    chatFullScreenErrorRefreshButtonText: 'Retry',
    chatFullScreenErrorRefreshButtonTextColor: '#4CAfAF',
    chatFullScreenErrorRefreshButtonVisible: true,
    chatProgressBarColor: '#9E9E9E',
    chatInputTextColor: '#212121',
    chatInputBackgroundColor: '#D1C4E9',
    chatInputHintText: 'Input Message',
    chatInputHintTextColor: '#212121',
    chatInputAttachmentIcon: assetUri(attachmentIcon),
    chatInputAttachmentIconTint: '#fe0000',
    chatInputAttachmentDisabledIconTint: '#9E9E9E',
    chatInputAttachmentBackgroundColor: '#673AB7',
    chatInputAttachmentBackgroundDrawable: '',
    chatInputSendIcon: assetUri(sendButtonIcon),
    chatInputSendIconTint: '#fe0000',
    chatInputSendDisabledIconTint: '#9E9E9E',
    chatInputSendBackgroundColor: '#673AB7',
    chatInputSendBackgroundDrawable: '',
    chatInputSeparatorLineColor: '#BDBDBD',
    chatInputSeparatorLineVisible: true,
    chatInputCursorColor: '#9E9E9E',
    chatInputCharCounterTextAppearance: 'TextAppearance_AppCompat_Caption',
    chatInputCharCounterDefaultColor: '#d0d32f',
    chatInputCharCounterAlertColor: '#2fd358',
    chatBackgroundColor: '#673AB7',
    chatInputTextAppearance: 'TextAppearance_AppCompat_Subtitle',
  };
}

const ChatOptionsScreen: React.FC<ScreenProps<'ChatOptionsScreen'>> = ({
  navigation,
}) => {
  const [form, setForm] = useState(emptyForm);
  const [feedback, setFeedback] = useState<{
    section: Section;
    value: Feedback;
  }>();
  const update = (change: Partial<typeof emptyForm>) =>
    setForm(previous => ({...previous, ...change}));
  const show = (section: Section, value: Feedback) =>
    setFeedback({section, value});
  const noticeFor = (section: Section) =>
    feedback?.section === section ? <Notice {...feedback.value} /> : null;

  const personalize = (
    onPersonalized: (context: PersonalizeContext) => void,
  ) => {
    const subject = form.subject.trim();
    const userAttributes: Record<string, string> = {};
    if (form.firstName.trim()) {
      userAttributes.firstName = form.firstName.trim();
    }
    if (form.lastName.trim()) {
      userAttributes.lastName = form.lastName.trim();
    }
    if (!subject || Object.keys(userAttributes).length === 0) {
      show('person', {
        tone: 'error',
        title: 'Enter a subject and a first or last name',
      });
      return;
    }
    mobileMessaging.personalize(
      {
        userIdentity: buildUserIdentity(form.subjectType, subject),
        userAttributes,
        forceDepersonalize: form.forceDepersonalize,
        keepAsLead: form.keepAsLead,
      },
      onPersonalized,
      // Errors here come from the Mobile Messaging API, not from the chat JWT.
      (error: MobileMessagingError) =>
        show('person', errorFeedback('Personalize failed', error)),
    );
  };

  const personalizeOnly = () =>
    personalize(() => show('person', {tone: 'success', title: 'Personalized'}));

  /** Personalizes, then lets the chat request a fresh JWT whenever it needs one. */
  const authenticate = () => {
    const {subjectType} = form;
    const subject = form.subject.trim();
    personalize(() => {
      mobileMessaging.setChatJwtProvider(
        () =>
          generateChatJWT(
            subjectType,
            subject,
            LIVECHAT_WIDGET_ID,
            LIVECHAT_SECRET_KEY_JSON,
          ),
        (error: Error) => console.warn('Chat JWT provider failed', error),
      );
      show('person', {
        tone: 'success',
        title: 'Authenticated',
        message: 'Chat JWT provider is set.',
      });
    });
  };

  const whenChatAvailable = (open: () => void) => {
    mobileMessaging.isChatAvailable((isAvailable: boolean) => {
      if (isAvailable) {
        open();
      } else {
        show('chat', {
          tone: 'error',
          title: 'Chat is not available',
          message: 'Check the Live chat widget setup.',
        });
      }
    });
  };

  const showNativeChat = () =>
    whenChatAvailable(() => {
      mobileMessaging.setLanguage(
        'en',
        () => {},
        (error: MobileMessagingError) =>
          show('chat', errorFeedback('Setting language failed', error)),
      );
      mobileMessaging.showChat();
    });

  const showChatView = (screen: ChatViewScreenName) =>
    whenChatAvailable(() => navigation.navigate(screen));

  const enableCalls = () =>
    webRTCUI.enableChatCalls(
      () => show('calls', {tone: 'success', title: 'Chat calls enabled'}),
      (error: MobileMessagingError) =>
        show('calls', errorFeedback('Enabling calls failed', error)),
    );

  const disableCalls = () =>
    webRTCUI.disableCalls(
      () => show('calls', {tone: 'success', title: 'Calls disabled'}),
      (error: MobileMessagingError) =>
        show('calls', errorFeedback('Disabling calls failed', error)),
    );

  const applyCustomization = () => {
    mobileMessaging.setChatCustomization(buildChatCustomization());
    mobileMessaging.setWidgetTheme('dark');
    show('more', {tone: 'success', title: 'Customization applied'});
  };

  const sendContextualData = () =>
    mobileMessaging.sendContextualData(
      JSON.stringify({metadata: 'from react demo'}),
      'ALL',
      () => show('more', {tone: 'success', title: 'Contextual data sent'}),
      (error: MobileMessagingError) =>
        show('more', errorFeedback('Sending contextual data failed', error)),
    );

  return (
    <ScreenContainer>
      <Card
        title="Person"
        description="Personalize identifies who is chatting. Authenticate also sets a chat JWT provider, so the person chats as an authenticated customer.">
        <TextField
          label="First name"
          value={form.firstName}
          onChangeText={firstName => update({firstName})}
        />
        <TextField
          label="Last name"
          value={form.lastName}
          onChangeText={lastName => update({lastName})}
        />
        <View style={styles.pickerGroup}>
          <Text style={styles.label}>Subject type</Text>
          <View style={styles.picker}>
            <Picker
              selectedValue={form.subjectType}
              onValueChange={(subjectType: SubjectType) =>
                update({subjectType})
              }
              style={styles.pickerText}>
              {subjectTypes.map(type => (
                <Picker.Item
                  key={type.value}
                  label={type.label}
                  value={type.value}
                />
              ))}
            </Picker>
          </View>
        </View>
        <TextField
          label="Subject"
          value={form.subject}
          onChangeText={subject => update({subject})}
          autoCapitalize="none"
        />
        <SwitchRow
          label="Force depersonalize"
          value={form.forceDepersonalize}
          onValueChange={forceDepersonalize => update({forceDepersonalize})}
        />
        <SwitchRow
          label="Keep as lead"
          value={form.keepAsLead}
          onValueChange={keepAsLead => update({keepAsLead})}
        />
        {noticeFor('person')}
        <View style={styles.row}>
          <View style={styles.rowItem}>
            <Button
              variant="secondary"
              title="Personalize"
              onPress={personalizeOnly}
            />
          </View>
          <View style={styles.rowItem}>
            <Button title="Authenticate" onPress={authenticate} />
          </View>
        </View>
      </Card>

      <Card
        title="Open chat"
        description="The native chat screen, or ChatView embedded in your own React screens.">
        <Button title="Native chat screen" onPress={showNativeChat} />
        <Button
          variant="secondary"
          title="ChatView full screen"
          onPress={() => showChatView('ChatViewScreen')}
        />
        <Button
          variant="secondary"
          title="ChatView in a custom layout"
          onPress={() => showChatView('ChatViewCustomLayoutScreen')}
        />
        <Button
          variant="secondary"
          title="ChatView with multiple threads"
          onPress={() => showChatView('ChatViewMultithreadScreen')}
        />
        {noticeFor('chat')}
      </Card>

      <Card
        title="Calls"
        description="Voice and video calls from the chat, through WebRTC UI.">
        <View style={styles.row}>
          <View style={styles.rowItem}>
            <Button
              variant="secondary"
              title="Enable calls"
              onPress={enableCalls}
            />
          </View>
          <View style={styles.rowItem}>
            <Button
              variant="secondary"
              title="Disable calls"
              onPress={disableCalls}
            />
          </View>
        </View>
        {noticeFor('calls')}
      </Card>

      <Card title="More">
        <Button
          variant="secondary"
          title="Apply runtime customization"
          onPress={applyCustomization}
        />
        <Button
          variant="secondary"
          title="Send contextual data"
          onPress={sendContextualData}
        />
        {noticeFor('more')}
      </Card>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  pickerGroup: {
    gap: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  picker: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    backgroundColor: Colors.surface,
    overflow: 'hidden',
  },
  pickerText: {
    color: Colors.textPrimary,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  rowItem: {
    flex: 1,
  },
});

export default ChatOptionsScreen;
