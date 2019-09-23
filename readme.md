# react-native-mo-pushnotification

Push Notifications

## Installation

Install just like your ordinary react-native module.

For iOS:
- Enable Push Notification capability

For Android:
- Add Firebase (google-services.json)
- `apply plugin: 'com.google.gms.google-services'` in app/build.gradle

## TODO
- show local notifications
  - extra page?
- send notification
  - extra page?
- initial interaction?

## Usage

Please check the [example/](example/) code.

```ts
import { PushNotification } from 'react-native-mo-pushnotification';

// for debugging:
PushNotification.setVerbose(true);
```

### Permissions
```ts
// ask for permissions
if (await PushNotification.getPermissionStatus() !== PushNotificationPermissionStatus.GRANTED) {
  await PushNotification.requestPermission();
}

// open settings
await PushNotification.openSettings();
```

### Push Token
```ts
const token = await PushNotification.requestToken();
console.log('type', token.type); // ios-dev, ios or android-fcm.
// if this is ios-dev you need to send the push via apn-sandbox
console.log('token', token.token);
console.log('locale', token.locale); // en-US
console.log('id', token.id); // android app id or ios bundle id
```

### Show Notification
```ts
const notificationID = await PushNotification.showNotification({
  title: 'title',
  body: 'body',
  subtitle: 'subtitle',
  data: { someContextData: 'test' },
  badge: 2,
  ongoing: true,
  android: {
    // additional android args
    smallIcon: 'ic_icon_resource',
    channelID: 'my_channel',
    actions: [
      { id: 'id1', title: 'some-action-button' },
      { id: 'id1', html: '<font color="red">some-other-button</font>', background: true },
      // background will prevent the activity from being launched
    ],
  },
  ios: {
    // additional ios args
    categoryIdentifier: 'category1',
  },
});
```

### Interaction
```ts
const subscription = PushNotification.onNotification.subscribe((notification) => {
  // handle incoming data notification
});
// later:
subscription.release();

PushNotification.onInteraction.subscribe((notification) => {
  console.log('notification clicked!', notification);
  console.log('action', notification.action);
  // if you have added buttons to the notification, action will tell you
  // which one was pressed.
});

PushNotification.onShowNotification = (notification) => {
  if (currentPage === 'chat' && isChatNotification(notification)) {
    // do not show the notification
    tellChatPageToRefresh();
    return false;
  } else {
    return true;
  }
};
```

### Existing notifications
```ts
// get existing notifications
const notifications = await PushNotification.getNotifications();
for (const notification of notifications) {
  // and remove them
  await PushNotification.removeNotification(notification.id);
}
```

### Misc
```ts
// run with background task / wake lock
await PushNotification.runInBackground(async () => {
  // handle something that should not be interrupted
});
```

### iOS
```ts
// set application badge
await PushNotification.iosSetBadge(99);

// setup categories
await PushNotification.iosSetupCategories([
  {
    identifier: 'category1',
    options: IosCategoryOptions.AllowInCarPlay + IosCategoryOptions.CustomDismissAction,
    intentIdentifiers: [],
    actions: [
      { identifier: 'action1', title: 'start-app', options: IosCategoryActionOptions.Foreground },
      // foreground will make this launch the app
      { identifier: 'cation2', title: 'cancel', options: IosCategoryActionOptions.Destructive },
    ],
  },
]);
```

### Android
```ts
// setup channels
await PushNotification.androidSetupChannels([
  {
    id: 'channel1',
    name: 'Channel 1',
    lockscreenVisibility: ...,
    bypassDnd: true,
    sound: 'sound_resource_raw',
  },
]);

// start main activity. very limited since android Q
await PushNotification.androidStartMainActivity();
```
