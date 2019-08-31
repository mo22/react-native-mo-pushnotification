import { NativeModules, Platform } from 'react-native';
export var VibrateType;
(function (VibrateType) {
    VibrateType[VibrateType["LONG_PRESS"] = 0] = "LONG_PRESS";
    VibrateType[VibrateType["VIRTUAL_KEY"] = 1] = "VIRTUAL_KEY";
    VibrateType[VibrateType["KEYBOARD_TAP"] = 3] = "KEYBOARD_TAP";
    VibrateType[VibrateType["CLOCK_TICK"] = 4] = "CLOCK_TICK";
    VibrateType[VibrateType["CALENDAR_DATE"] = 5] = "CALENDAR_DATE";
    VibrateType[VibrateType["CONTEXT_CLICK"] = 6] = "CONTEXT_CLICK";
    VibrateType[VibrateType["KEYBOARD_RELEASE"] = 7] = "KEYBOARD_RELEASE";
    VibrateType[VibrateType["VIRTUAL_KEY_RELEASE"] = 8] = "VIRTUAL_KEY_RELEASE";
    VibrateType[VibrateType["TEXT_HANDLE_MOVE"] = 9] = "TEXT_HANDLE_MOVE";
    VibrateType[VibrateType["ENTRY_BUMP"] = 10] = "ENTRY_BUMP";
    VibrateType[VibrateType["DRAG_CROSSING"] = 11] = "DRAG_CROSSING";
    VibrateType[VibrateType["GESTURE_START"] = 12] = "GESTURE_START";
    VibrateType[VibrateType["GESTURE_END"] = 13] = "GESTURE_END";
    VibrateType[VibrateType["EDGE_SQUEEZE"] = 14] = "EDGE_SQUEEZE";
    VibrateType[VibrateType["EDGE_RELEASE"] = 15] = "EDGE_RELEASE";
    VibrateType[VibrateType["CONFIRM"] = 16] = "CONFIRM";
    VibrateType[VibrateType["REJECT"] = 17] = "REJECT";
})(VibrateType || (VibrateType = {}));
export const Module = (Platform.OS === 'android') ? NativeModules.ReactNativeMoVibrate : undefined;
//# sourceMappingURL=android.js.map