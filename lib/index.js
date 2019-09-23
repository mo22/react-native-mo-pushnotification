import { Event } from 'mo-core';
import * as ios from './ios';
import * as android from './android';
export var PushNotificationPermissionStatus;
(function (PushNotificationPermissionStatus) {
    PushNotificationPermissionStatus["GRANTED"] = "granted";
    PushNotificationPermissionStatus["DENIED"] = "denied";
    PushNotificationPermissionStatus["UNKNOWN"] = "unknown";
})(PushNotificationPermissionStatus || (PushNotificationPermissionStatus = {}));
export const IosCategoryOptions = ios.CategoryOptions;
export const IosCategoryActionOptions = ios.CategoryActionOptions;
export class PushNotification {
    /**
     * be verbose
     */
    static setVerbose(verbose) {
        this.verbose = verbose;
        if (ios.Module) {
            ios.Module.setVerbose(verbose);
        }
        else if (android.Module) {
            android.Module.setVerbose(verbose);
        }
    }
    /**
     * set the application's badge
     * works fine in ios, only partial support in android
     */
    static async setBadge(value) {
        if (ios.Module) {
            ios.Module.setApplicationIconBadgeNumber(value);
        }
        else if (android.Module) {
            android.Module.setShortcutBadger(value);
        }
    }
    /**
     * check if push permissions have been granted
     */
    static async getPermissionStatus() {
        if (ios.Module) {
            const status = await ios.Module.getNotificationSettings();
            if (status.authorizationStatus === ios.AuthorizationStatus.Authorized)
                return PushNotificationPermissionStatus.GRANTED;
            if (status.authorizationStatus === ios.AuthorizationStatus.Denied)
                return PushNotificationPermissionStatus.DENIED;
            return PushNotificationPermissionStatus.UNKNOWN;
        }
        else if (android.Module) {
            return PushNotificationPermissionStatus.GRANTED;
        }
        else {
            return PushNotificationPermissionStatus.UNKNOWN;
        }
    }
    /**
     * request push permissions
     */
    static async requestPermission() {
        if (ios.Module) {
            const status = await ios.Module.getNotificationSettings();
            if (status.authorizationStatus === ios.AuthorizationStatus.Authorized)
                return PushNotificationPermissionStatus.GRANTED;
            if (status.authorizationStatus === ios.AuthorizationStatus.Denied)
                return PushNotificationPermissionStatus.DENIED;
            try {
                await ios.Module.requestAuthorization(ios.AuthorizationOption.Badge + ios.AuthorizationOption.Alert + ios.AuthorizationOption.Sound);
                return PushNotificationPermissionStatus.GRANTED;
            }
            catch (e) {
                return PushNotificationPermissionStatus.DENIED;
            }
        }
        else if (android.Module) {
            return PushNotificationPermissionStatus.GRANTED;
        }
        else {
            return PushNotificationPermissionStatus.DENIED;
        }
    }
    /**
     * open the notification settings
     */
    static async openSettings() {
        if (ios.Module) {
            ios.Module.openNotificationSettings();
        }
        else if (android.Module) {
            android.Module.openNotificationSettings();
            // android.Module.openNotificationChannelSettings('c1'); // ?
        }
    }
    /**
     * run callback with a background task / wake lock held.
     */
    static async runInBackground(callback) {
        if (ios.Module) {
            const id = await ios.Module.beginBackgroundTask();
            try {
                return await callback();
            }
            finally {
                ios.Module.endBackgroundTask(id);
            }
        }
        else if (android.Module) {
            const id = await android.Module.acquireWakeLock('runInBackground', 1000 * 60 * 5);
            try {
                return await callback();
            }
            finally {
                android.Module.releaseWakeLock(id);
            }
        }
        else {
            return callback();
        }
    }
    /**
     * request notification token
     */
    static async requestToken() {
        if (this.verbose)
            console.log('ReactNativeMoPushNotification', 'requestToken');
        if (ios.Module) {
            if (!this.currentToken) {
                if (await this.requestPermission() !== 'granted') {
                    throw new Error('ReactNativeMoPushNotification.requestToken: permissions not granted');
                }
                this.currentToken = await new Promise((resolve, reject) => {
                    let sub = ios.Events.addListener('ReactNativeMoPushNotification', (rs) => {
                        if (rs.type === 'didFailToRegisterForRemoteNotificationsWithError') {
                            if (sub) {
                                sub.remove();
                                sub = undefined;
                            }
                            reject(new Error(rs.message));
                        }
                        else if (rs.type === 'didRegisterForRemoteNotificationsWithDeviceToken') {
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
                    ios.Module.registerForRemoteNotifications();
                });
            }
            return this.currentToken;
        }
        else if (android.Module) {
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
        }
        else {
            throw new Error('not supported');
        }
    }
    /**
     * setup ios categories
     */
    static async iosSetupCategories(categories) {
        if (ios.Module) {
            ios.Module.setupCategories(categories);
        }
    }
    /**
     * setup android push channels
     */
    static async androidSetupChannels(channels) {
        if (android.Module) {
            for (const channel of channels) {
                android.Module.createNotificationChannel(channel);
            }
        }
    }
    /**
     * start android main activity, force in foreground
     * @TODO: android Q prevents this.
     */
    static async androidStartMainActivity() {
        if (android.Module) {
            android.Module.startMainActivity();
        }
    }
    // @TODO: only on subscribe etc.
    static init() {
        if (ios.Module) {
            const convertNotification = (rs) => {
                const data = { ...rs.userInfo };
                delete data.aps;
                return {
                    id: rs.identifier,
                    date: rs.date * 1000,
                    title: rs.title || undefined,
                    body: rs.body || undefined,
                    data: data,
                };
            };
            ios.Events.addListener('ReactNativeMoPushNotification', (rs) => {
                if (this.verbose)
                    console.log('ReactNativeMoPushNotification event', rs);
                if (rs.type === 'didReceiveRemoteNotification') {
                    console.log('XXX didReceiveRemoteNotification');
                    const data = { ...rs.userInfo };
                    delete data.aps;
                    // @TODO: what else?
                    const notification = {
                        id: '?',
                        date: Date.now(),
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
                                ios.Module.invokeCallback(rs.callbackKey, ios.BackgroundFetchResult.NewData);
                            }
                            else {
                                ios.Module.invokeCallback(rs.callbackKey, ios.BackgroundFetchResult.NoData);
                            }
                        }
                        catch (e) {
                            ios.Module.invokeCallback(rs.callbackKey, ios.BackgroundFetchResult.Failed);
                            throw e;
                        }
                    });
                }
                else if (rs.type === 'willPresentNotification') {
                    // @TODO: also trigger onNotification here?
                    const notification = convertNotification(rs.notification);
                    if (this.onNotificationEmit) {
                        this.onNotificationEmit(notification);
                    }
                    Promise.resolve(this.onShowNotification(notification)).then((result) => {
                        if (result) {
                            ios.Module.invokeCallback(rs.callbackKey, ios.AuthorizationOption.Sound + ios.AuthorizationOption.Alert + ios.AuthorizationOption.Badge);
                        }
                        else {
                            ios.Module.invokeCallback(rs.callbackKey, 0);
                        }
                    });
                }
                else if (rs.type === 'didReceiveNotificationResponse') {
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
                    ios.Module.invokeCallback(rs.callbackKey, 0);
                }
            });
        }
        else if (android.Module) {
            android.Events.addListener('ReactNativeMoPushNotification', (rs) => {
                if (this.verbose)
                    console.log('ReactNativeMoPushNotification event', rs);
                if (rs.type === 'onMessageReceived') {
                    const notification = {
                        id: rs.messageId,
                        date: rs.sentTime,
                        data: rs.data,
                        title: rs.title || undefined,
                        body: rs.body || undefined,
                    };
                    if (this.onNotificationEmit) {
                        this.onNotificationEmit(notification);
                    }
                    this.runInBackground(async () => {
                        if (rs.title || rs.body) {
                            const res = await this.onShowNotification(notification);
                            if (res) {
                                await this.showNotification(notification);
                            }
                        }
                        await this.onFetchData(notification);
                    });
                }
                else if (rs.type === 'onNotificationClicked') {
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
                }
                else if (rs.type === 'onNotificationIntent') {
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
    static async getNotifications() {
        if (ios.Module) {
            let tmp = await ios.Module.getDeliveredNotifications();
            return tmp.map((rs) => {
                const data = { ...rs.userInfo };
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
        }
        else if (android.Module) {
            let tmp = await android.Module.getNotifications();
            if (tmp === undefined)
                return [];
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
        }
        else {
            return [];
        }
    }
    /**
     * remove a notification from the notification center
     */
    static async removeNotification(id) {
        if (ios.Module) {
            ios.Module.removeDeliveredNotifications([id]);
        }
        else if (android.Module) {
            android.Module.cancelNotification(parseInt(id));
        }
    }
    /**
     * show a notification
     */
    static async showNotification(args) {
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
        }
        else if (android.Module) {
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
/**
 * native ios functions. use with caution
 */
PushNotification.ios = ios;
/**
 * native android functions. use with caution
 */
PushNotification.android = android;
/**
 * called when a notification is received
 */
PushNotification.onNotification = new Event((emit) => {
    PushNotification.onNotificationEmit = emit;
    return () => {
        PushNotification.onNotificationEmit = undefined;
    };
});
/**
 * called when a notification is clicked / interacted with
 */
PushNotification.onInteraction = new Event((emit) => {
    PushNotification.onInteractionEmit = emit;
    return () => {
        PushNotification.onInteractionEmit = undefined;
    };
});
/**
 * called when the app is in foreground and a notification is received,
 * before the notification is shown.
 * return false here to prevent the notification from being shown.
 * i.e. a new chat while that chat is currently open
 */
PushNotification.onShowNotification = () => true;
/**
 * called when a notification is received. app is running in background for
 * some time until this callback is finished.
 * can be used to load more data.
 */
PushNotification.onFetchData = () => true;
PushNotification.verbose = false;
PushNotification.androidKnownNotifications = {};
PushNotification.init(); // @TODO: remove
//# sourceMappingURL=index.js.map