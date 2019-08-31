import * as ios from './ios';
import * as android from './android';
export declare enum VibrateType {
    /**
     * just a slight tap
     */
    TAP = "tap",
    /**
     * a little bit more
     */
    MEDIUM = "medium",
    /**
     * bang it!
     */
    HEAVY = "heavy",
    /**
     * twice, short
     */
    TWICE = "twice"
}
export declare class Vibrate {
    /**
     * native ios functions. use with caution
     */
    static readonly ios: typeof ios;
    /**
     * native android functions. use with caution
     */
    static readonly android: typeof android;
    /**
     * Vibrate.Type enum
     */
    static readonly Type: typeof VibrateType;
    /**
     * Vibrate. See Vibrate.Type
     */
    static vibrate(type: VibrateType): void;
}
