import * as ios from './ios';
import * as android from './android';

export enum VibrateType {
  /**
   * just a slight tap
   */
  TAP = 'tap',

  /**
   * a little bit more
   */
  MEDIUM = 'medium',

  /**
   * bang it!
   */
  HEAVY = 'heavy',

  /**
   * twice, short
   */
  TWICE = 'twice',
}

export class Vibrate {
  /**
   * native ios functions. use with caution
   */
  public static readonly ios = ios;

  /**
   * native android functions. use with caution
   */
  public static readonly android = android;

  /**
   * Vibrate.Type enum
   */
  public static readonly Type = VibrateType;

  /**
   * Vibrate. See Vibrate.Type
   */
  public static vibrate(type: VibrateType) {
    if (ios.Module) {
      if (type === VibrateType.TAP) {
        ios.Module.vibrate(ios.VibrateType.ImpactLight);
      } else if (type === VibrateType.MEDIUM) {
        ios.Module.vibrate(ios.VibrateType.ImpactMedium);
      } else if (type === VibrateType.HEAVY) {
        ios.Module.vibrate(ios.VibrateType.ImpactHeavy);
      } else if (type === VibrateType.TWICE) {
        ios.Module.vibrate(ios.VibrateType.NotificationSuccess);
      } else {
        ios.Module.vibrate(ios.VibrateType.ImpactLight);
      }
    } else if (android.Module) {
      if (type === VibrateType.TAP) {
        android.Module.vibrate(android.VibrateType.KEYBOARD_TAP);
      } else if (type === VibrateType.MEDIUM) {
        android.Module.vibrate(android.VibrateType.LONG_PRESS);
      } else if (type === VibrateType.HEAVY) {
        android.Module.vibrate(android.VibrateType.CONTEXT_CLICK);
      } else if (type === VibrateType.TWICE) {
        android.Module.vibrate(android.VibrateType.REJECT);
      } else {
        android.Module.vibrate(android.VibrateType.KEYBOARD_TAP);
      }
    }
  }

}
