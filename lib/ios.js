import { NativeModules, NativeEventEmitter, Platform } from 'react-native';
export var AuthorizationOption;
(function (AuthorizationOption) {
    AuthorizationOption[AuthorizationOption["Badge"] = 1] = "Badge";
    AuthorizationOption[AuthorizationOption["Sound"] = 2] = "Sound";
    AuthorizationOption[AuthorizationOption["Alert"] = 4] = "Alert";
    AuthorizationOption[AuthorizationOption["CarPlay"] = 8] = "CarPlay";
    AuthorizationOption[AuthorizationOption["CriticalAlert"] = 16] = "CriticalAlert";
    AuthorizationOption[AuthorizationOption["ProvidesAppNotificationSettings"] = 32] = "ProvidesAppNotificationSettings";
})(AuthorizationOption || (AuthorizationOption = {}));
export var BackgroundFetchResult;
(function (BackgroundFetchResult) {
    BackgroundFetchResult[BackgroundFetchResult["NewData"] = 1] = "NewData";
    BackgroundFetchResult[BackgroundFetchResult["NoData"] = 2] = "NoData";
    BackgroundFetchResult[BackgroundFetchResult["Failed"] = 3] = "Failed";
})(BackgroundFetchResult || (BackgroundFetchResult = {}));
export var AuthorizationStatus;
(function (AuthorizationStatus) {
    AuthorizationStatus[AuthorizationStatus["NotDetermined"] = 0] = "NotDetermined";
    AuthorizationStatus[AuthorizationStatus["Denied"] = 1] = "Denied";
    AuthorizationStatus[AuthorizationStatus["Authorized"] = 2] = "Authorized";
    AuthorizationStatus[AuthorizationStatus["Provisional"] = 3] = "Provisional";
})(AuthorizationStatus || (AuthorizationStatus = {}));
export var NotificationSetting;
(function (NotificationSetting) {
    NotificationSetting[NotificationSetting["NotSupported"] = 0] = "NotSupported";
    NotificationSetting[NotificationSetting["Disabled"] = 1] = "Disabled";
    NotificationSetting[NotificationSetting["Enabled"] = 2] = "Enabled";
})(NotificationSetting || (NotificationSetting = {}));
export var PushKitType;
(function (PushKitType) {
    PushKitType["VoIP"] = "PKPushTypeVoIP";
    PushKitType["Complication"] = "PKPushTypeComplication";
    PushKitType["FileProvider"] = "PKPushTypeFileProvider";
})(PushKitType || (PushKitType = {}));
export var CategoryActionOptions;
(function (CategoryActionOptions) {
    CategoryActionOptions[CategoryActionOptions["AuthenticationRequired"] = 1] = "AuthenticationRequired";
    CategoryActionOptions[CategoryActionOptions["Destructive"] = 2] = "Destructive";
    CategoryActionOptions[CategoryActionOptions["Foreground"] = 4] = "Foreground";
})(CategoryActionOptions || (CategoryActionOptions = {}));
export var CategoryOptions;
(function (CategoryOptions) {
    CategoryOptions[CategoryOptions["CustomDismissAction"] = 1] = "CustomDismissAction";
    CategoryOptions[CategoryOptions["AllowInCarPlay"] = 2] = "AllowInCarPlay";
    CategoryOptions[CategoryOptions["HiddenPreviewsShowTitle"] = 4] = "HiddenPreviewsShowTitle";
    CategoryOptions[CategoryOptions["HiddenPreviewsShowSubtitle"] = 8] = "HiddenPreviewsShowSubtitle";
})(CategoryOptions || (CategoryOptions = {}));
export const Module = (Platform.OS === 'android') ? NativeModules.ReactNativeMoPushNotification : undefined;
export const Events = Module ? new NativeEventEmitter(NativeModules.ReactNativeMoPushNotification) : undefined;
//# sourceMappingURL=ios.js.map