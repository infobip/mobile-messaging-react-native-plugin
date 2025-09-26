import React, {useState} from 'react';
import {
  Text,
  TextInput,
  View,
  Switch,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import {
  mobileMessaging,
  webRTCUI,
  UserIdentity,
  MobileMessagingError,
  ChatException,
} from 'infobip-mobile-messaging-react-native-plugin';
import Colors from '../../constants/Colors';
import PrimaryButton from '../../components/PrimaryButton';
import {NavigationContainer, NavigationProp} from '@react-navigation/native';
import {Picker} from '@react-native-picker/picker';
import {handleJWTError} from '../../utils/JWTErrorHandler';
import {SubjectType} from '../../constants/SubjectType';
import {generateChatJWT} from '../../utils/JWTUtils';

interface PersonalizationData {
  userIdentity: UserIdentity;
  userAttributes: Record<string, string | number | boolean | object[]>;
  forceDepersonalize: boolean;
  keepAsLead: boolean;
  subjectType: SubjectType;
  subject: string;
}

interface ChatScreenProps {
  navigation: NavigationProp<any>;
}

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
 */
const LIVECHAT_SECRET_KEY_JSON = 'YOUR_LIVECHAT_SECRET_KEY_JSON';

const ChatOptionsScreen: React.FC<ChatScreenProps> = ({navigation}) => {
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [subjectType, setSubjectType] = useState<SubjectType>(
    SubjectType.ExternalPersonId,
  );
  const [subject, setSubject] = useState<string>('');
  const [forceDepersonalize, setForceDepersonalize] = useState<boolean>(true);
  const [keepAsLead, setKeepAsLead] = useState<boolean>(false);

  const preparePersonalizationData = (): PersonalizationData | null => {
    const trimmedSubject = subject.trim();
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();

    if (!trimmedSubject) {
      Alert.alert('Validation Error', 'Please enter a valid subject.');
      return null;
    }

    if (!trimmedFirstName && !trimmedLastName) {
      Alert.alert(
        'Validation Error',
        'Please enter at least a first or last name.',
      );
      return null;
    }

    const userIdentity: UserIdentity = {};
    switch (subjectType) {
      case SubjectType.Email:
        userIdentity.emails = [trimmedSubject];
        break;
      case SubjectType.PhoneNumber:
        userIdentity.phones = [trimmedSubject];
        break;
      case SubjectType.ExternalPersonId:
        userIdentity.externalUserId = trimmedSubject;
        break;
      default:
        Alert.alert('Validation Error', 'Invalid subject type selected.');
        return null;
    }

    const userAttributes: Record<string, string> = {};
    if (trimmedFirstName) userAttributes.firstName = trimmedFirstName;
    if (trimmedLastName) userAttributes.lastName = trimmedLastName;

    return {
      userIdentity,
      userAttributes,
      forceDepersonalize,
      keepAsLead,
      subjectType,
      subject: trimmedSubject,
    };
  };

  const triggerPersonalization = () => {
    const personalizationData = preparePersonalizationData();
    console.log('Personalize with data:', personalizationData);
    personalize(personalizationData);
  };

  const personalize = (
    personalizationData: PersonalizationData | null,
    successCallback?: (context: any) => void,
    errorCallback?: (error: MobileMessagingError) => void,
  ) => {
    if (!personalizationData) return;
    mobileMessaging.personalize(
      {
        userIdentity: personalizationData.userIdentity,
        userAttributes: personalizationData.userAttributes,
        forceDepersonalize: personalizationData.forceDepersonalize,
        keepAsLead: personalizationData.keepAsLead,
      },
      personalizeContext => {
        if (successCallback) {
          successCallback(personalizeContext);
        } else {
          Alert.alert(
            'Personalized',
            JSON.stringify(personalizeContext, null, 2),
          );
        }
      },
      (error: MobileMessagingError) => {
        if (errorCallback) {
          errorCallback(error);
        } else {
          handleJWTError(error);
        }
      },
    );
  };

  const triggerAuthentication = () => {
    const personalizationData = preparePersonalizationData();
    console.log('Authenticate with data:', personalizationData);
    authenticate(personalizationData);
  };

  const authenticate = (personalizationData: PersonalizationData | null) => {
    if (!personalizationData) return;

    personalize(
      personalizationData,
      personalizeContext => {
        console.log('React app: Setting chat JWT provider.');
        mobileMessaging.setChatJwtProvider(
          async () => {
            const jwt = await generateChatJWT(
              personalizationData.subjectType,
              personalizationData.subject,
              LIVECHAT_WIDGET_ID,
              LIVECHAT_SECRET_KEY_JSON,
            );
            console.log('React app: Providing new JWT: ', jwt);
            return jwt;
          },
          (error: Error) => {
            console.log('React app: Error from chat JWT provider:', error);
          },
        );
        Alert.alert(
          'Authenticated',
          JSON.stringify(personalizeContext, null, 2),
        );
      },
      (error: MobileMessagingError) => {
        console.log('React app: Personalization error:', error);
        handleJWTError(error); //It is MM SDK JWT error handler not chat JWT
      },
    );
  };

  const showChat = () => {
    mobileMessaging.setLanguage(
      'en',
      (language: any) => console.log('Language set ' + language),
      (error: MobileMessagingError) =>
        console.log('Error setting language: ' + JSON.stringify(error)),
    );
    // Uncomment to use custom exception handler
    // mobileMessaging.setChatExceptionHandler(
    //   (exception: ChatException) => console.log('Chat exception received: ' + JSON.stringify(exception)),
    //   (error: Error) => console.log('Chat exception handler error: ' + error)
    // );
    mobileMessaging.showChat();
  };

  const showChatViewScreen = () => {
    navigation.navigate('ChatViewScreen');
  };

  const showChatViewCustomLayoutScreen = () => {
    navigation.navigate('ChatViewCustomLayoutScreen');
  };

  const showChatViewMultithreadScreen = () => {
    navigation.navigate('ChatViewMultithreadScreen');
  };

  const enableWebRTC = () => {
    webRTCUI.enableChatCalls(
      () => console.log('WebRTCUI enabled chat calls'),
      (error: MobileMessagingError) =>
        console.log(
          'WebRTCUI could not enable chat calls, error: ' +
            JSON.stringify(error),
        ),
    );
  };

  const disableWebRTC = () => {
    webRTCUI.disableCalls(
      () => console.log('WebRTCUI disabled calls'),
      (error: MobileMessagingError) =>
        console.log(
          'WebRTCUI could not disable calls, error: ' + JSON.stringify(error),
        ),
    );
  };

  const customize = () => {
    const sendButtonIcon = require('../../assets/ic_send.png');
    const attachmentIcon = require('../../assets/ic_add_circle.png');
    const navigationIcon = require('../../assets/ic_back.png');
    const downloadIcon = require('../../assets/ic_download.png');
    const resolveAssetSource = require('react-native/Libraries/Image/resolveAssetSource');
    const settings = {
      chatStatusBarBackgroundColor: '#673AB7',
      chatStatusBarIconsColorMode: 'dark',
      attachmentPreviewToolbarSaveMenuItemIcon:
        resolveAssetSource(downloadIcon).uri,
      attachmentPreviewToolbarMenuItemsIconTint: '#9E9E9E',
      chatToolbar: {
        titleTextAppearance: 'TextAppearance_AppCompat_Title',
        titleTextColor: '#FFFFFF',
        titleText: 'Some new title',
        titleCentered: true,
        backgroundColor: '#673AB7',
        navigationIcon: resolveAssetSource(navigationIcon).uri,
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
        navigationIcon: resolveAssetSource(navigationIcon).uri,
        navigationIconTint: '#FFFFFF',
        subtitleTextAppearance: 'TextAppearance_AppCompat_Subtitle',
        subtitleTextColor: '#FFFFFF',
        subtitleText: 'Attachment preview subtitle',
        subtitleCentered: false,
      },
      networkErrorText: 'Network error',
      networkErrorTextColor: '#FFFFFF',
      networkErrorLabelBackgroundColor: '#212121',
      chatProgressBarColor: '#9E9E9E',
      chatInputTextColor: '#212121',
      chatInputBackgroundColor: '#D1C4E9',
      chatInputHintText: 'Input Message',
      chatInputHintTextColor: '#212121',
      chatInputAttachmentIcon: resolveAssetSource(attachmentIcon).uri,
      chatInputAttachmentIconTint: '#9E9E9E',
      chatInputAttachmentBackgroundColor: '#673AB7',
      chatInputAttachmentBackgroundDrawable: '',
      chatInputSendIcon: resolveAssetSource(sendButtonIcon).uri,
      chatInputSendIconTint: '#9E9E9E',
      chatInputSendBackgroundColor: '#673AB7',
      chatInputSendBackgroundDrawable: '',
      chatInputSeparatorLineColor: '#BDBDBD',
      chatInputSeparatorLineVisible: true,
      chatInputCursorColor: '#9E9E9E',
      networkErrorTextAppearance: 'TextAppearance_AppCompat_Title',
      chatBackgroundColor: '#673AB7',
      chatInputTextAppearance: 'TextAppearance_AppCompat_Subtitle',
    };
    mobileMessaging.setChatCustomization(settings);
    mobileMessaging.setWidgetTheme('dark');
    console.log('Style applied');
  };

  const sendContextualData = () => {
    mobileMessaging.sendContextualData(
      "{'metadata': 'from react demo'}",
      'ALL',
      () => console.log('MobileMessaging metadata sent'),
      (error: MobileMessagingError) =>
        console.log('MobileMessaging metadata error: ' + error),
    );
  };

  return (
    <ScrollView style={{marginTop: 10}}>
      <View style={styles.inputContainer}>
        <Text style={styles.instructionText}>
          Please enter your personalization data:
        </Text>

        {/* First Name */}
        <Text style={styles.label}>First Name:</Text>
        <TextInput
          style={styles.textInput}
          value={firstName}
          onChangeText={setFirstName}
        />

        {/* Last Name */}
        <Text style={styles.label}>Last Name:</Text>
        <TextInput
          style={styles.textInput}
          value={lastName}
          onChangeText={setLastName}
        />

        {/* Subject Type */}
        <Text style={styles.label}>Subject type:</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={subjectType}
            style={styles.picker}
            onValueChange={(itemValue: SubjectType) =>
              setSubjectType(itemValue)
            }>
            <Picker.Item
              label="External person ID"
              value={SubjectType.ExternalPersonId}
            />
            <Picker.Item label="Phone number" value={SubjectType.PhoneNumber} />
            <Picker.Item label="E-mail" value={SubjectType.Email} />
          </Picker>
        </View>

        {/* Subject */}
        <Text style={styles.label}>Subject:</Text>
        <TextInput
          style={styles.textInput}
          value={subject}
          onChangeText={setSubject}
        />

        {/* Force Depersonalize */}
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Force Depersonalize</Text>
          <Switch
            value={forceDepersonalize}
            onValueChange={setForceDepersonalize}
          />
        </View>

        {/* Keep As Lead */}
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Keep As Lead</Text>
          <Switch value={keepAsLead} onValueChange={setKeepAsLead} />
        </View>

        {/* Buttons */}
        <View style={styles.buttonsContainer}>
          <View style={styles.buttonContainer}>
            <PrimaryButton onPress={triggerAuthentication}>
              Authenticate
            </PrimaryButton>
          </View>
          <View style={styles.buttonContainer}>
            <PrimaryButton onPress={triggerPersonalization}>
              Personalize
            </PrimaryButton>
          </View>
        </View>
      </View>
      <PrimaryButton onPress={showChat}>Show Native Chat</PrimaryButton>
      <PrimaryButton onPress={showChatViewScreen}>
        Show React Component ChatView
      </PrimaryButton>
      <PrimaryButton onPress={showChatViewCustomLayoutScreen}>
        Show React Component ChatView in custom layout
      </PrimaryButton>
      <PrimaryButton onPress={showChatViewMultithreadScreen}>
        Show React Component ChatView multithread
      </PrimaryButton>
      <PrimaryButton onPress={enableWebRTC}>Enable Calls</PrimaryButton>
      <PrimaryButton onPress={disableWebRTC}>Disable Calls</PrimaryButton>
      <PrimaryButton onPress={customize}>
        Apply Runtime Customization
      </PrimaryButton>
      <PrimaryButton onPress={sendContextualData}>
        Send Contextual Data
      </PrimaryButton>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  inputContainer: {
    marginHorizontal: 24,
    marginBottom: 8,
    padding: 16,
    backgroundColor: Colors.primary500,
    borderRadius: 8,
    elevation: 4,
    shadowColor: Colors.primaryGray,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 6,
    shadowOpacity: 0.25,
  },
  instructionText: {
    fontSize: 18,
    color: Colors.tintWhite,
    marginBottom: 16,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    color: Colors.tintWhite,
    marginBottom: 4,
    marginLeft: 4,
  },
  textInput: {
    height: 40,
    width: '100%',
    borderColor: Colors.tintWhite,
    borderWidth: 1,
    borderRadius: 4,
    color: Colors.primaryGray,
    marginBottom: 12,
    paddingHorizontal: 10,
    backgroundColor: Colors.tintWhite,
  },
  pickerWrapper: {
    height: 40,
    width: '100%',
    borderColor: Colors.tintWhite,
    borderWidth: 1,
    borderRadius: 4,
    color: Colors.primaryGray,
    marginBottom: 12,
    paddingHorizontal: 10,
    backgroundColor: Colors.tintWhite,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  picker: {
    height: 40,
    width: '100%',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  switchLabel: {
    fontSize: 16,
    color: Colors.tintWhite,
  },
  sectionTitle: {
    fontSize: 18,
    color: Colors.tintWhite,
    marginVertical: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  buttonsContainer: {
    flexDirection: 'row',
    marginTop: 16,
  },
  buttonContainer: {
    flex: 1,
    marginHorizontal: 5,
  },
});

export default ChatOptionsScreen;
