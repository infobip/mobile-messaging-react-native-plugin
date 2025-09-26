import AsyncStorage from '@react-native-async-storage/async-storage';
import type {Message, CustomMessageStorage} from 'infobip-mobile-messaging-react-native-plugin';

const MyMessageStorage: CustomMessageStorage = {
  save(messages: Message[]) {
    for (const message of messages) {
      AsyncStorage.setItem(message.messageId, JSON.stringify(message));
    }
    console.log('[CustomStorage] Saving messages: ' + JSON.stringify(messages));
  },

  async find(messageId: string, callback: (message: Message | null) => void): Promise<void> {
    console.log('[CustomStorage] Find message: ' + messageId);
    try {
      const messageString = await AsyncStorage.getItem(messageId);
      if (messageString) {
        console.log('[CustomStorage] Found message: ' + messageString);
        const message: Message = JSON.parse(messageString);
        callback(message);
      } else {
        console.log('[CustomStorage] Message not found');
        callback(null);
      }
    } catch (error) {
      console.log('[CustomStorage] Error finding message: ', error);
      callback(null);
    }
  },

  findAll(callback: (messages: Message[]) => void): void {
    console.log('[CustomStorage] Find all');
    this.getAllMessages((messages: Message[]) => {
      console.log('[CustomStorage] Find all messages result: ', messages);
      callback(messages);
    });
  },

  start() {
    console.log('[CustomStorage] Start');
  },

  stop() {
    console.log('[CustomStorage] Stop');
  },

  getAllMessages(callback: (messages: Message[]) => void): void {
    AsyncStorage.getAllKeys()
      .then((keys) => {
        console.log('[CustomStorage] All Keys: ', keys);
        return AsyncStorage.multiGet(keys);
      })
      .then((stores) => {
        console.log('[CustomStorage] All Values: ', stores);
        const messages: Message[] = stores
          .map(([_, value]) => {
            if (value) {
              return JSON.parse(value) as Message;
            }
            return null;
          })
          .filter((message): message is Message => message !== null);
        callback(messages);
      })
      .catch((error) => {
        console.log('[CustomStorage] Error: ', error);
        callback([]);
      });
  },
};

export default MyMessageStorage;
