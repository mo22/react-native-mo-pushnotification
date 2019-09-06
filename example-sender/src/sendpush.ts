import * as apn from 'apn';
import * as firebase from 'firebase-admin';
import * as fs from 'fs';



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
  credential: firebase.credential.cert(require('../xxx.json')),
});



export async function sendpush(data: { title?: string; message?: string; sound?: string; badge?: number; channelID?: string; data?: any; }) {
  console.log('sendpush', data);
  try {

    const tokens: { [id: string]: { type: string; token: string; id: string; locale: string; } } = JSON.parse((await fs.promises.readFile('state/pushToken.json')).toString());
    for (const token of Object.values(tokens)) {
      console.log('token', token);
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
          console.error(e);
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
        }
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

  } catch (e) {
    console.error('sendpush', e);
  }
}



if (require.main === module) {
  (async () => {
    await sendpush({ message: 'message' });
    process.exit(0);
  })().catch(console.error);
}
