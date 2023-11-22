import { EmitterSubscription } from 'react-native';
import { Event } from 'mo-core';
import * as ios from './ios';
import * as android from './android';

/**
 * a push notification token / subscription
 */
export interface PushNotificationToken {
  /** type of token */
  type: 'ios-dev' | 'ios' | 'android-fcm';
  /** the actual token */
  token: string;
  /** the id of this app: bundle id or package */
  id: string;
  /** the locale of this app */
  locale: string;
}

export interface PushNotificationNotification {
  id?: string;
  date?: number;
  data?: any;

  title?: string;
  body?: string;
  subtitle?: string;
  sound?: string;
  badge?: number;
  threadID?: string;
  channelID?: string;
  category?: string;
  color?: number;
  ongoing?: boolean;
  icon?: string;

  android?: Partial<android.Notification>; // @TODO
  ios?: Partial<ios.NotificationArgs>; // @TODO
}

export enum PushNotificationPermissionStatus {
  GRANTED = 'granted',
  DENIED = 'denied',
  UNKNOWN = 'unknown',
}

export const IosCategoryOptions = ios.CategoryOptions;
export const IosCategoryActionOptions = ios.CategoryActionOptions;

export class PushNotification {
  /**
   * native ios functions. use with caution
   */
  public static readonly ios = ios;

  /**
   * native android functions. use with caution
   */
  public static readonly android = android;

  /**
   * called when a notification is received
   */
  public static readonly onNotification = new Event<PushNotificationNotification>((emit) => {
    PushNotification.onNotificationEmit = emit;
    return () => {
      PushNotification.onNotificationEmit = undefined;
    };
  });
  private static onNotificationEmit?: (notification: PushNotificationNotification) => void;

  /**
   * called when a notification is clicked / interacted with
   */
  public static readonly onInteraction = new Event<PushNotificationNotification & { action: string; }>((emit) => {
    PushNotification.onInteractionEmit = emit;
    return () => {
      PushNotification.onInteractionEmit = undefined;
    };
  });
  private static onInteractionEmit?: (notification: PushNotificationNotification & { action: string; }) => void;

  /**
   * the last interaction that happened. can be used to check the initial
   * interaction that opened the app
   */
  public static lastInteraction?: PushNotificationNotification & { action: string; };

  /**
   * called when the app is in foreground and a notification is received,
   * before the notification is shown.
   * return false here to prevent the notification from being shown.
   * i.e. a new chat while that chat is currently open
   */
  public static onShowNotification: (notification: PushNotificationNotification) => boolean | Promise<boolean> = () => true;

  /**
   * called when a notification is received. app is running in background for
   * some time until this callback is finished.
   * can be used to load more data.
   */
  public static onFetchData: (notification: PushNotificationNotification) => boolean | Promise<boolean> = () => true;

  private static verbose: boolean = false;

  private static currentToken?: PushNotificationToken;
  private static androidKnownNotifications: { [id: number]: PushNotificationNotification; } = {};

  /**
   * be verbose
   */
  public static setVerbose(verbose: boolean) {
    this.verbose = verbose;
    if (ios.Module) {
      ios.Module.setVerbose(verbose);
    } else if (android.Module) {
      android.Module.setVerbose(verbose);
    }
  }

  /**
   * check if push permissions have been granted
   */
  public static async getPermissionStatus(): Promise<PushNotificationPermissionStatus> {
    if (ios.Module) {
      const status = await ios.Module.getNotificationSettings();
      if (status.authorizationStatus === ios.AuthorizationStatus.Authorized) return PushNotificationPermissionStatus.GRANTED;
      if (status.authorizationStatus === ios.AuthorizationStatus.Denied) return PushNotificationPermissionStatus.DENIED;
      return PushNotificationPermissionStatus.UNKNOWN;
    } else if (android.Module) {
      return PushNotificationPermissionStatus.GRANTED;
    } else {
      return PushNotificationPermissionStatus.UNKNOWN;
    }
  }

  /**
   * request push permissions
   */
  public static async requestPermission(): Promise<PushNotificationPermissionStatus> {
    if (ios.Module) {
      const status = await ios.Module.getNotificationSettings();
      if (status.authorizationStatus === ios.AuthorizationStatus.Authorized) return PushNotificationPermissionStatus.GRANTED;
      if (status.authorizationStatus === ios.AuthorizationStatus.Denied) return PushNotificationPermissionStatus.DENIED;
      try {
        await ios.Module.requestAuthorization(ios.AuthorizationOption.Badge + ios.AuthorizationOption.Alert + ios.AuthorizationOption.Sound);
        return PushNotificationPermissionStatus.GRANTED;
      } catch (e) {
        return PushNotificationPermissionStatus.DENIED;
      }
    } else if (android.Module) {
      return PushNotificationPermissionStatus.GRANTED;
    } else {
      return PushNotificationPermissionStatus.DENIED;
    }
  }

  /**
   * open the notification settings
   */
  public static async openSettings() {
    if (ios.Module) {
      ios.Module.openNotificationSettings();
    } else if (android.Module) {
      android.Module.openNotificationSettings();
      // android.Module.openNotificationChannelSettings('c1'); // ?
    }
  }

  /**
   * run callback with a background task / wake lock held.
   */
  public static async runInBackground<T>(callback: () => Promise<T>): Promise<T> {
    if (ios.Module) {
      const id = await ios.Module.beginBackgroundTask();
      try {
        return await callback();
      } finally {
        ios.Module.endBackgroundTask(id);
      }
    } else if (android.Module) {
      const id = await android.Module.acquireWakeLock('runInBackground', 1000 * 60 * 5);
      try {
        return await callback();
      } finally {
        android.Module.releaseWakeLock(id);
      }
    } else {
      return callback();
    }
  }

  /**
   * request notification token
   */
  public static async requestToken(): Promise<PushNotificationToken> {
    if (this.verbose) console.log('ReactNativeMoPushNotification', 'requestToken');
    if (ios.Module) {
      if (!this.currentToken) {
        if (await this.requestPermission() !== 'granted') {
          throw new Error('ReactNativeMoPushNotification.requestToken: permissions not granted');
        }
        this.currentToken = await new Promise<PushNotificationToken>((resolve, reject) => {
          let sub: EmitterSubscription | undefined = ios.Events!.addListener('ReactNativeMoPushNotification', (rs) => {
            if (rs.type === 'didFailToRegisterForRemoteNotificationsWithError') {
              if (sub) {
                sub.remove();
                sub = undefined;
              }
              reject(new Error(rs.message));
            } else if (rs.type === 'didRegisterForRemoteNotificationsWithDeviceToken') {
              if (sub) {
                sub.remove();
                sub = undefined;
              }
              resolve({
                type: rs.isDevEnvironment ? 'ios-dev' : 'ios',
                token: rs.deviceToken,
                id: rs.bundle,
                locale: rs.locale,
              });
            }
          });
          ios.Module!.registerForRemoteNotifications();
        });

      }
      return this.currentToken;

    } else if (android.Module) {
      if (!this.currentToken) {
        if (await this.requestPermission() !== 'granted') {
          throw new Error('ReactNativeMoPushNotification.requestToken: permissions not granted');
        }
        const token = await android.Module.getFirebaseInstanceId();
        const info = await android.Module.getSystemInfo();
        this.currentToken = {
          token: token,
          type: 'android-fcm',
          id: info.packageName,
          locale: info.locale,
        };
      }
      return this.currentToken;

    } else {
      throw new Error('not supported');
    }
  }

  /**
   * set ios application badge
   */
  public static async iosSetBadge(value: number) {
    if (ios.Module) {
      ios.Module.setApplicationIconBadgeNumber(value);
    }
  }

  /**
   * setup ios categories
   */
  public static async iosSetupCategories(categories: ios.Category[]) {
    if (ios.Module) {
      ios.Module.setupCategories(categories);
    }
  }

  /**
   * setup android push channels
   */
  public static async androidSetupChannels(channels: (Partial<android.Channel> & { id: string; })[]) {
    if (android.Module) {
      for (const channel of channels) {
        android.Module.createNotificationChannel(channel);
      }
    }
  }

  private static setupEventsDone = false;

  public static setupEvents() {
    if (this.setupEventsDone) return;
    this.setupEventsDone = true;
    if (ios.Module) {
      const convertNotification = (rs: ios.DeliveredNotification): PushNotificationNotification => {
        const data: any = { ...rs.userInfo };
        delete data.aps;
        return {
          id: rs.identifier,
          date: rs.date * 1000,
          title: rs.title || undefined,
          body: rs.body || undefined,
          data: data,
        };
      };

      ios.Events!.addListener('ReactNativeMoPushNotification', (rs) => {
        if (this.verbose) console.log('ReactNativeMoPushNotification event', rs);

        if (rs.type === 'didReceiveRemoteNotification') {
          const data: any = { ...rs.userInfo };
          delete data.aps;
          // @TODO: what else?
          const notification: PushNotificationNotification = {
            id: '?',
            date: Date.now(), // ?
            badge: rs.userInfo.aps && rs.userInfo.aps.badge,
            sound: rs.userInfo.aps && rs.userInfo.aps.sound,
            title: rs.userInfo.aps && rs.userInfo.aps.alert && rs.userInfo.aps.alert.title,
            subtitle: rs.userInfo.aps && rs.userInfo.aps.alert && rs.userInfo.aps.alert.subtitle,
            body: rs.userInfo.aps && rs.userInfo.aps.alert && rs.userInfo.aps.alert.body,
            data: data,
          };
          if (this.onNotificationEmit) {
            this.onNotificationEmit(notification);
          }
          // @TODO fetch data for all notfications?
          this.runInBackground(async () => {
            try {
              const res = await this.onFetchData(notification);
              if (res) {
                ios.Module!.invokeCallback(rs.callbackKey, ios.BackgroundFetchResult.NewData);
              } else {
                ios.Module!.invokeCallback(rs.callbackKey, ios.BackgroundFetchResult.NoData);
              }
            } catch (e) {
              ios.Module!.invokeCallback(rs.callbackKey, ios.BackgroundFetchResult.Failed);
              throw e;
            }
          });

        } else if (rs.type === 'willPresentNotification') {
          // @TODO: also trigger onNotification here?
          const notification = convertNotification(rs.notification);
          if (this.onNotificationEmit) {
            this.onNotificationEmit(notification);
          }
          Promise.resolve(this.onShowNotification(notification)).then((result) => {
            if (result) {
              ios.Module!.invokeCallback(rs.callbackKey, ios.AuthorizationOption.Sound + ios.AuthorizationOption.Alert + ios.AuthorizationOption.Badge);
            } else {
              ios.Module!.invokeCallback(rs.callbackKey, 0);
            }
          });

        } else if (rs.type === 'didReceiveNotificationResponse') {
          // what if this is our initial notification? then there is no listener yet...
          this.lastInteraction = {
            ...convertNotification(rs.notification),
            action: rs.actionIdentifier,
          };
          if (this.onInteractionEmit) {
            this.onInteractionEmit({
              ...convertNotification(rs.notification),
              action: (rs.actionIdentifier === 'com.apple.UNNotificationDefaultActionIdentifier') ? 'default' : rs.actionIdentifier,
            });
          }
          ios.Module!.invokeCallback(rs.callbackKey, 0);

        }

      });

    } else if (android.Module) {
      android.Events!.addListener('ReactNativeMoPushNotification', (rs) => {
        if (this.verbose) console.log('ReactNativeMoPushNotification event', rs);

        if (rs.type === 'onMessageReceived') {
          const notification: PushNotificationNotification = {
            id: rs.messageId,
            date: rs.sentTime, // * 1000 ?
            data: rs.data,
            title: rs.title || undefined,
            body: rs.body || undefined,
          };
          if (this.onNotificationEmit) {
            this.onNotificationEmit(notification);
          }

          this.runInBackground(async () => {
            if (rs.title || rs.body) {
              await this.showNotification(notification);
            }
            await this.onFetchData(notification);
          });

        } else if (rs.type === 'onNotificationClicked') {
          if (this.onInteractionEmit) {
            this.onInteractionEmit({
              id: String(rs.id),
              channelID: rs.channelID || undefined,
              title: rs.title || undefined,
              subtitle: rs.subtext || undefined,
              body: rs.body || undefined,
              badge: rs.number,
              color: rs.color,
              data: rs.data,
              action: rs.action || 'default',
            });
          }

        } else if (rs.type === 'onNotificationIntent') {
          if (this.onInteractionEmit) {
            this.onInteractionEmit({
              id: rs.messageId,
              data: rs.data,
              action: 'default',
            });
          }

        }
      });

    }
  }

  /**
   * get the active notifications from the notification center
   */
  public static async getNotifications(): Promise<(PushNotificationNotification & { id: string; })[]> {
    if (ios.Module) {
      let tmp = await ios.Module.getDeliveredNotifications();
      return tmp.map((rs) => {
        const data: any = { ...rs.userInfo };
        delete data.aps;
        return {
          id: rs.identifier,
          date: rs.date * 1000,
          title: rs.title || undefined,
          subtitle: rs.subtitle || undefined,
          body: rs.body || undefined,
          sound: rs.sound || undefined,
          badge: rs.badge || undefined,
          category: rs.categoryIdentifier || undefined,
          threadID: rs.threadIdentifier || undefined,
          data: data,
        };
      });

    } else if (android.Module) {
      let tmp = await android.Module.getNotifications();
      if (tmp === undefined) return [];
      return tmp.map((rs) => {
        return {
          id: rs.id,
          date: rs.postTime * 1000,
          title: rs.title || undefined,
          subtitle: rs.subtext || undefined,
          body: rs.body || undefined,
          badge: rs.number || undefined,
          color: rs.color,
          ongoing: rs.ongoing,
          channelID: rs.channelID,
          data: rs.data,
        };
      });

    } else {
      return [];

    }
  }

  /**
   * remove a notification from the notification center
   */
  public static async removeNotification(id: string) {
    if (ios.Module) {
      ios.Module.removeDeliveredNotifications([id]);
    } else if (android.Module) {
      android.Module.cancelNotification(parseInt(id));
    }
  }

  /**
   * show a notification
   */
  public static async showNotification(args: PushNotificationNotification): Promise<string | undefined> {
    if (ios.Module) {
      const id = Date.now().toString();
      await ios.Module.showNotification({
        id: id,
        body: args.body,
        title: args.title,
        sound: (args.sound !== undefined) ? (args.sound + '.aiff') : undefined,
        badge: args.badge,
        subtitle: args.subtitle,
        threadIdentifier: args.threadID,
        categoryIdentifier: args.category,
        userInfo: args.data,
        ...(args.ios || {}),
      });
      return id;

    } else if (android.Module) {
      const res = await this.onShowNotification(args);
      if (!res) return undefined;
      const id = await android.Module.showNotification({
        channelID: args.channelID,
        body: args.body,
        title: args.title,
        subtext: args.subtitle,
        smallIcon: args.icon,
        sound: args.sound,
        ongoing: args.ongoing,
        autoCancel: !args.ongoing,
        number: args.badge,
        groupKey: args.threadID,
        data: args.data,
        ...(args.android || {}),
      });
      this.androidKnownNotifications[id] = args;
      return String(id);

    }
    return undefined;
  }

}

PushNotification.setupEvents();
