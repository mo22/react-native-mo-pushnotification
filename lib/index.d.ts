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
    android?: Partial<android.Notification>;
    ios?: Partial<ios.NotificationArgs>;
}
export declare enum PushNotificationPermissionStatus {
    GRANTED = "granted",
    DENIED = "denied",
    UNKNOWN = "unknown"
}
export declare const IosCategoryOptions: typeof ios.CategoryOptions;
export declare const IosCategoryActionOptions: typeof ios.CategoryActionOptions;
export declare class PushNotification {
    /**
     * native ios functions. use with caution
     */
    static readonly ios: typeof ios;
    /**
     * native android functions. use with caution
     */
    static readonly android: typeof android;
    /**
     * called when a notification is received
     */
    static readonly onNotification: Event<PushNotificationNotification>;
    private static onNotificationEmit?;
    /**
     * called when a notification is clicked / interacted with
     */
    static readonly onInteraction: Event<PushNotificationNotification & {
        action: string;
    }>;
    private static onInteractionEmit?;
    /**
     * the last interaction that happened. can be used to check the initial
     * interaction that opened the app
     */
    static lastInteraction?: PushNotificationNotification & {
        action: string;
    };
    /**
     * called when the app is in foreground and a notification is received,
     * before the notification is shown.
     * return false here to prevent the notification from being shown.
     * i.e. a new chat while that chat is currently open
     */
    static onShowNotification: (notification: PushNotificationNotification) => boolean | Promise<boolean>;
    /**
     * called when a notification is received. app is running in background for
     * some time until this callback is finished.
     * can be used to load more data.
     */
    static onFetchData: (notification: PushNotificationNotification) => boolean | Promise<boolean>;
    private static verbose;
    private static currentToken?;
    private static androidKnownNotifications;
    /**
     * be verbose
     */
    static setVerbose(verbose: boolean): void;
    /**
     * check if push permissions have been granted
     */
    static getPermissionStatus(): Promise<PushNotificationPermissionStatus>;
    /**
     * request push permissions
     */
    static requestPermission(): Promise<PushNotificationPermissionStatus>;
    /**
     * open the notification settings
     */
    static openSettings(): Promise<void>;
    /**
     * run callback with a background task / wake lock held.
     */
    static runInBackground<T>(callback: () => Promise<T>): Promise<T>;
    /**
     * request notification token
     */
    static requestToken(): Promise<PushNotificationToken>;
    /**
     * set ios application badge
     */
    static iosSetBadge(value: number): Promise<void>;
    /**
     * setup ios categories
     */
    static iosSetupCategories(categories: ios.Category[]): Promise<void>;
    /**
     * setup android push channels
     */
    static androidSetupChannels(channels: (Partial<android.Channel> & {
        id: string;
    })[]): Promise<void>;
    private static setupEventsDone;
    static setupEvents(): void;
    /**
     * get the active notifications from the notification center
     */
    static getNotifications(): Promise<(PushNotificationNotification & {
        id: string;
    })[]>;
    /**
     * remove a notification from the notification center
     */
    static removeNotification(id: string): Promise<void>;
    /**
     * show a notification
     */
    static showNotification(args: PushNotificationNotification): Promise<string | undefined>;
}
