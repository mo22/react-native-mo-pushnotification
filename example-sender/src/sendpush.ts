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
          ...(data.data !== undefined) && {
            data: {
              ...data.data,
            },
          },
          ...(data.message !== undefined) && {
            notification: {
              title: data.title || '',
              body: data.message,
              sound: data.sound || 'ping',
              channelId: data.channelID || 'default',
              icon: 'ic_launcher', // always required...
            },
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
        ...(data.data !== undefined) && {
          contentAvailable: true,
          payload: {
            ...data.data,
          },
        },
        ...(data.message !== undefined) && {
          sound: data.sound ? (data.sound + '.caf') : 'ping.caf',
          alert: {
            title: data.title || '',
            body: data.message,
          },
          topic: token.id,
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
}


if (require.main === module) {
  (async () => {
    const token1: PushNotificationToken = JSON.parse(`
      {"type":"ios-dev","token":"1E87399AC29346ACC738ECA69428873EE76F3A2192D4EDBA06210F4BC3DBD7DA","id":"de.mxs.reactnativemopushnotification.example","locale":"en-DE"}
    `);
    const token2: PushNotificationToken = JSON.parse(`
      {"token":"fvY_nOB1OkM:APA91bH30nwNeMKjJy89zjSdyBM68ETNZvHKjy3PapQkhQDnR-3NHk9in9VDEMcagl6ACmYpFwvxdpm-gICIlfSeQ0_5kui--S9eZvVgeRYvYdvltQ6AgDmtgeSvaMjZPvG-rlIeTsNz","type":"android-fcm","id":"de.mxs.reactnativemopushnotification.example","locale":"de-DE"}
    `);
    // await sendpush(token1, { message: 'message ' + new Date().toISOString() });
    // await sendpush(token2, { message: 'message ' + new Date().toISOString() });
    await sendpush(token1, { data: { message: 'message ' + new Date().toISOString() } });
    await sendpush(token2, { data: { message: 'message ' + new Date().toISOString() } });
    process.exit(0);
  })().catch(console.error);
}
