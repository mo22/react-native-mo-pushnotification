import * as ios from './ios';
import * as android from './android';
export var VibrateType;
(function (VibrateType) {
    /**
     * just a slight tap
     */
    VibrateType["TAP"] = "tap";
    /**
     * a little bit more
     */
    VibrateType["MEDIUM"] = "medium";
    /**
     * bang it!
     */
    VibrateType["HEAVY"] = "heavy";
    /**
     * twice, short
     */
    VibrateType["TWICE"] = "twice";
})(VibrateType || (VibrateType = {}));
export class Vibrate {
    /**
     * Vibrate. See Vibrate.Type
     */
    static vibrate(type) {
        if (ios.Module) {
            if (type === VibrateType.TAP) {
                ios.Module.vibrate(ios.VibrateType.ImpactLight);
            }
            else if (type === VibrateType.MEDIUM) {
                ios.Module.vibrate(ios.VibrateType.ImpactMedium);
            }
            else if (type === VibrateType.HEAVY) {
                ios.Module.vibrate(ios.VibrateType.ImpactHeavy);
            }
            else if (type === VibrateType.TWICE) {
                ios.Module.vibrate(ios.VibrateType.NotificationSuccess);
            }
            else {
                ios.Module.vibrate(ios.VibrateType.ImpactLight);
            }
        }
        else if (android.Module) {
            if (type === VibrateType.TAP) {
                android.Module.vibrate(android.VibrateType.KEYBOARD_TAP);
            }
            else if (type === VibrateType.MEDIUM) {
                android.Module.vibrate(android.VibrateType.LONG_PRESS);
            }
            else if (type === VibrateType.HEAVY) {
                android.Module.vibrate(android.VibrateType.CONTEXT_CLICK);
            }
            else if (type === VibrateType.TWICE) {
                android.Module.vibrate(android.VibrateType.REJECT);
            }
            else {
                android.Module.vibrate(android.VibrateType.KEYBOARD_TAP);
            }
        }
    }
}
/**
 * native ios functions. use with caution
 */
Vibrate.ios = ios;
/**
 * native android functions. use with caution
 */
Vibrate.android = android;
/**
 * Vibrate.Type enum
 */
Vibrate.Type = VibrateType;
//# sourceMappingURL=index.js.map