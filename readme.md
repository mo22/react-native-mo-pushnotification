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

### Push Token

### Show Notification

### Interaction


public static readonly onNotification = new Event<PushNotificationNotification>((emit) => {

public static readonly onInteraction = new Event<PushNotificationNotification & { action: string; }>((emit) => {

public static lastInteraction?: PushNotificationNotification & { action: string; };

public static onShowNotification: (notification: PushNotificationNotification) => boolean|Promise<boolean> = () => true;

public static async getPermissionStatus(): Promise<PushNotificationPermissionStatus> {

public static async requestPermission(): Promise<PushNotificationPermissionStatus> {

public static async openSettings() {

public static async runInBackground<T>(callback: () => Promise<T>): Promise<T> {

  public static async requestToken(): Promise<PushNotificationToken> {

    public static async iosSetBadge(value: number) {
    public static async iosSetupCategories(categories: ios.Category[]) {
