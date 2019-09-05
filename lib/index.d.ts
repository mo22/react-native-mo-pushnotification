import { Subject } from 'rxjs';
import * as ios from './ios';
import * as android from './android';
export interface PushNotificationToken {
    type: 'ios-dev' | 'ios' | 'android-fcm';
    token: string;
    id: string;
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
    extraKey?: string;
    android?: Partial<android.Notification>;
    ios?: Partial<ios.NotificationArgs>;
}
export declare enum PushNotificationPermissionStatus {
    GRANTED = "granted",
    DENIED = "denied",
    UNKNOWN = "unknown"
}
export declare class PushNotification {
    static readonly ios: typeof ios;
    static readonly android: typeof android;
    static readonly onNotification: Subject<PushNotificationNotification>;
    static readonly onInteraction: Subject<PushNotificationNotification & {
        action: string;
    }>;
    static lastInteraction?: PushNotificationNotification & {
        action: string;
    };
    static onShowNotification: (notification: PushNotificationNotification) => boolean | Promise<boolean>;
    static onFetchData: (notification: PushNotificationNotification) => boolean | Promise<boolean>;
    private static verbose;
    private static currentToken?;
    private static androidKnownNotifications;
    static setVerbose(verbose: boolean): void;
    static setBadge(value: number): void;
    static getPermissionStatus(): Promise<PushNotificationPermissionStatus>;
    static requestPermission(): Promise<PushNotificationPermissionStatus>;
    static openSettings(): void;
    static runInBackground<T>(callback: () => Promise<T>): Promise<T>;
    static requestToken(): Promise<PushNotificationToken>;
    static iosSetupCategories(categories: ios.Category[]): void;
    static androidSetupChannels(channels: (Partial<android.Channel> & {
        id: string;
    })[]): void;
    static androidStartMainActivity(): void;
    static init(): void;
    static getNotifications(): Promise<(PushNotificationNotification & {
        id: string;
    })[]>;
    static removeNotification(id: string): void;
    static showNotification(args: PushNotificationNotification): Promise<string | undefined>;
}
