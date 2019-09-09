import * as apn from 'apn';
import * as firebase from 'firebase-admin';


/**
 * a push notification token / subscription
 */
export interface PushNotificationToken {
  /** type of token */
  type: 'ios-dev'|'ios'|'android-fcm';
  /** the actual token */
  token: string;
  /** the id of this app: bundle id or package */
  id: string;
  /** the locale of this app */
  locale: string;
}



const apnProvider = new apn.Provider({
  key: 'apns.pem',
  cert: 'apns.pem',
  production: true,
});
const apnDevProvider = new apn.Provider({
  key: 'apns.pem',
  cert: 'apns.pem',
  production: false,
});
const firebaseProvider = firebase.initializeApp({
  credential: firebase.credential.cert(require('../firebase.json')),
});



export async function sendpush(token: PushNotificationToken, data: { title?: string; message?: string; sound?: string; badge?: number; channelID?: string; data?: any; }) {
  console.log('sendpush', data);
  if (token.type === 'android-fcm') {
    try {
      const res = await firebaseProvider.messaging().send({
        token: token.token,
        android: {
          priority: 'high',
          data: {
            ...data.data,
          },
          notification: {
            title: data.title || '',
            body: data.message,
            sound: data.sound || 'ping',
            channelId: data.channelID || 'default',
            icon: 'ic_launcher', // always required...
          },
        },
      });
      console.log('res', res);
    } catch (e) {
      if (e.constructor.name === 'FirebaseMessagingError') {
        // e.errorInfo.code == 'messaging/registration-token-not-registered'
      }
      throw e;
    }

  } else if (token.type === 'ios' || token.type === 'ios-dev') {
    try {
      const note = new apn.Notification({
        expiry: Math.floor(Date.now() / 1000) + 7200,
        sound: data.sound ? (data.sound + '.caf') : 'ping.caf',
        contentAvailable: true,
        alert: {
          title: data.title || '',
          body: data.message,
        },
        topic: token.id,
        payload: {
          ...data.data,
        },
      });
      if (data.badge !== undefined) note.badge = data.badge;
      if (token.type === 'ios') {
        const res = await apnProvider.send(note, token.token);
        console.log('res', res);
      } else if (token.type === 'ios-dev') {
        const res = await apnDevProvider.send(note, token.token);
        console.log('res', res);
      }
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  // apnProvider.shutdown();
  // apnDevProvider.shutdown();
  // {
  //   const tmp = (apnProvider as any);
  //   for (const i of tmp.client.endpointManager._endpoints) {
  //     i._socket.unref();
  //     i._heartBeatIntervalCheck.unref();
  //   }
  // }
  // {
  //   const tmp = (apnDevProvider as any);
  //   for (const i of tmp.client.endpointManager._endpoints) {
  //     i._socket.unref();
  //     i._heartBeatIntervalCheck.unref();
  //   }
  // }
}


if (require.main === module) {
  (async () => {
    const token1: PushNotificationToken = (
      { type: 'ios-dev',
        token: '3E7F9B9ABBDB5C66C4685B2635E803E7A26E85A456A50A8B3E4C5D4DA5084942',
        id: 'de.mxs.reactnativemopushnotification.example',
        locale: 'en-DE' }
    );
    const token2: PushNotificationToken = (
      { token: 'cm9yOjXlaAc:APA91bGFzcro4N6bEp_TT-zE9izPGIdOceGS-dOCv8_Bd9xEYsbOvnxLkqivuZcMXCnHFU7Zjk-rx5DnlDlxdIm5spvAltXx8cYC_p3Ed04ykoPBj1h1lpJHKiV9tNLJdze6KolCvZ8y',
            type: 'android-fcm',
            id: 'de.mxs.reactnativemopushnotification.example',
            locale: 'de-DE' }
    );
    await sendpush(token1, { message: 'message' });
    await sendpush(token2, { message: 'message' });
    process.exit(0);
  })().catch(console.error);
}
