import { EmitterSubscription } from 'react-native';
export declare enum AuthorizationOption {
    Badge = 1,
    Sound = 2,
    Alert = 4,
    CarPlay = 8,
    CriticalAlert = 16,
    ProvidesAppNotificationSettings = 32
}
export declare enum BackgroundFetchResult {
    NewData = 1,
    NoData = 2,
    Failed = 3
}
export declare enum AuthorizationStatus {
    NotDetermined = 0,
    Denied = 1,
    Authorized = 2,
    Provisional = 3
}
export declare enum NotificationSetting {
    NotSupported = 0,
    Disabled = 1,
    Enabled = 2
}
export declare enum PushKitType {
    VoIP = "PKPushTypeVoIP",
    Complication = "PKPushTypeComplication",
    FileProvider = "PKPushTypeFileProvider"
}
export interface DeliveredNotification {
    body?: string | null;
    sound?: string | null;
    launchImageName?: string | null;
    badge?: number | null;
    subtitle?: string | null;
    title?: string | null;
    identifier: string;
    summaryArgumentCount?: number | null;
    summaryArgument?: string | null;
    date: number;
    categoryIdentifier?: string | null;
    threadIdentifier?: string | null;
    userInfo?: object;
}
export interface NotificationSettings {
    authorizationStatus: AuthorizationStatus;
    soundSetting: number;
    badgeSetting: number;
    alertSetting: number;
    notificationCenterSetting: number;
    lockScreenSetting: number;
    carPlaySetting: number;
    alertStyle: number;
    showPreviewsSetting?: number;
    criticalAlertSetting?: number;
    providesAppNotificationSettings?: number;
}
export interface NotificationArgs {
    id: string;
    title?: string;
    subtitle?: string;
    body?: string;
    badge?: number;
    sound?: string;
    categoryIdentifier?: string;
    threadIdentifier?: string;
    userInfo?: any;
}
export declare enum CategoryActionOptions {
    AuthenticationRequired = 1,
    Destructive = 2,
    Foreground = 4
}
export interface CategoryAction {
    identifier: string;
    title: string;
    options: CategoryActionOptions;
}
export declare enum CategoryOptions {
    CustomDismissAction = 1,
    AllowInCarPlay = 2,
    HiddenPreviewsShowTitle = 4,
    HiddenPreviewsShowSubtitle = 8
}
export interface Category {
    identifier: string;
    options: CategoryOptions;
    intentIdentifiers: string[];
    actions: CategoryAction[];
}
export interface Module {
    setVerbose(verbose: boolean): void;
    invokeCallback(key: string, value: any): void;
    setApplicationIconBadgeNumber(value: number): void;
    getApplicationIconBadgeNumber(): Promise<number>;
    registerForRemoteNotifications(): void;
    isRegisteredForRemoteNotifications(): Promise<boolean>;
    requestAuthorization(options: AuthorizationOption): Promise<void>;
    getNotificationSettings(): Promise<NotificationSettings>;
    removeDeliveredNotifications(ids: string[]): void;
    beginBackgroundTask(): Promise<string>;
    endBackgroundTask(key: string): void;
    getDeliveredNotifications(): Promise<DeliveredNotification[]>;
    openNotificationSettings(): void;
    showNotification(args: NotificationArgs): Promise<void>;
    setupCategories(categories: Category[]): void;
    pushKitInit(types: PushKitType[]): void;
}
export declare type Event = {
    type: 'didRegisterForRemoteNotificationsWithDeviceToken';
    deviceToken: string;
    isDevEnvironment: boolean;
    bundle: string;
    locale: string;
} | {
    type: 'didFailToRegisterForRemoteNotificationsWithError';
    message: string;
    code: number;
} | {
    type: 'didReceiveRemoteNotification';
    userInfo: {
        [k: string]: any;
        aps: {
            sound?: string;
            badge?: number;
            ['content-available']?: 1 | 0;
            alert?: {
                body?: string;
                title?: string;
                subtitle?: string;
            };
        };
    };
    callbackKey: string;
} | {
    type: 'didReceiveNotificationResponse';
    actionIdentifier: string;
    notification: DeliveredNotification;
    callbackKey: string;
} | {
    type: 'willPresentNotification';
    notification: DeliveredNotification;
    callbackKey: string;
} | {
    type: 'didUpdatePushCredentials';
    pushType: PushKitType;
    pushCredentials: string;
    isDevEnvironment: boolean;
    bundle: string;
    locale: string;
} | {
    type: 'didInvalidatePushToken';
    pushType: PushKitType;
} | {
    type: 'didReceiveIncomingPush';
    pushType: PushKitType;
    payload: any;
    callbackKey: string;
    extraKey?: string;
};
export declare const Module: Module | undefined;
export declare const Events: {
    addListener(eventType: "ReactNativeMoPushNotification", listener: (event: Event) => void): EmitterSubscription;
} | undefined;
