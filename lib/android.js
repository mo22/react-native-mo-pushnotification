import { NativeModules, NativeEventEmitter, Platform } from 'react-native';
export var Importance;
(function (Importance) {
    Importance[Importance["NONE"] = 0] = "NONE";
    Importance[Importance["MIN"] = 1] = "MIN";
    Importance[Importance["LOW"] = 2] = "LOW";
    Importance[Importance["DEFAULT"] = 3] = "DEFAULT";
    Importance[Importance["HIGH"] = 4] = "HIGH";
})(Importance || (Importance = {}));
export var Visibility;
(function (Visibility) {
    Visibility[Visibility["PRIVATE"] = 0] = "PRIVATE";
    Visibility[Visibility["PUBLIC"] = 1] = "PUBLIC";
    Visibility[Visibility["SECRET"] = -1] = "SECRET";
})(Visibility || (Visibility = {}));
export var Priority;
(function (Priority) {
    Priority[Priority["DEFAULT"] = 0] = "DEFAULT";
    Priority[Priority["LOW"] = -1] = "LOW";
    Priority[Priority["MIN"] = -2] = "MIN";
    Priority[Priority["HIGH"] = 1] = "HIGH";
    Priority[Priority["MAX"] = 2] = "MAX";
})(Priority || (Priority = {}));
export const Module = (Platform.OS === 'android') ? NativeModules.ReactNativeMoPushNotification : undefined;
export const Events = Module ? new NativeEventEmitter(NativeModules.ReactNativeMoPushNotification) : undefined;
//# sourceMappingURL=android.js.map