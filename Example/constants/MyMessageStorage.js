import AsyncStorage from '@react-native-async-storage/async-storage';

const MyMessageStorage = {
  save(messages) {
    for (const [, message] of messages.entries()) {
      AsyncStorage.setItem(message.messageId, JSON.stringify(message));
    }
    console.log('[CustomStorage] Saving messages: ' + JSON.stringify(messages));
  },

  async find(messageId, callback) {
    console.log('[CustomStorage] Find message: ' + messageId);
    let message = await AsyncStorage.getItem(messageId);
    if (message) {
      console.log('[CustomStorage] Found message: ' + message);
      callback(JSON.parse(message));
    } else {
      callback({});
    }
  },

  findAll(callback) {
    console.log('[CustomStorage] Find all');
    this.getAllMessages(values => {
      console.log(
        '[CustomStorage] Find all messages result: ',
        values.toString(),
      );
      callback(values);
    });
  },

  start() {
    console.log('[CustomStorage] Start');
  },

  stop() {
    console.log('[CustomStorage] Stop');
  },

  getAllMessages(callback) {
    try {
      AsyncStorage.getAllKeys().then(keys => {
        console.log('Then AllKeys: ', keys);
        AsyncStorage.multiGet(keys).then(values => {
          console.log('Then AllValues: ', values);
          callback(values);
        });
      });
    } catch (error) {
      console.log('[CustomStorage] Error: ', error);
    }
  },
};

export default MyMessageStorage;
