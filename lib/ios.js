import { NativeModules, Platform } from 'react-native';
export var VibrateType;
(function (VibrateType) {
    VibrateType["ImpactLight"] = "ImpactLight";
    VibrateType["ImpactMedium"] = "ImpactMedium";
    VibrateType["ImpactHeavy"] = "ImpactHeavy";
    VibrateType["NotificationError"] = "NotificationError";
    VibrateType["NotificationWarning"] = "NotificationWarning";
    VibrateType["NotificationSuccess"] = "NotificationSuccess";
    VibrateType["SelectionChanged"] = "SelectionChanged";
    VibrateType["System"] = "System";
})(VibrateType || (VibrateType = {}));
export const Module = (Platform.OS === 'ios') ? NativeModules.ReactNativeMoVibrate : undefined;
//# sourceMappingURL=ios.js.map