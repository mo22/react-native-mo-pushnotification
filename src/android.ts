import { NativeModules, Platform } from 'react-native';

export enum VibrateType {
  LONG_PRESS = 0,
  VIRTUAL_KEY = 1,
  KEYBOARD_TAP = 3,
  CLOCK_TICK = 4,
  CALENDAR_DATE = 5,
  CONTEXT_CLICK = 6,
  KEYBOARD_RELEASE = 7,
  VIRTUAL_KEY_RELEASE = 8,
  TEXT_HANDLE_MOVE = 9,
  ENTRY_BUMP = 10,
  DRAG_CROSSING = 11,
  GESTURE_START = 12,
  GESTURE_END = 13,
  EDGE_SQUEEZE = 14,
  EDGE_RELEASE = 15,
  CONFIRM = 16,
  REJECT = 17,
}

export interface Module {
  vibrate(type: VibrateType): void;
  vibratePattern(args: { pattern: number[]; amplitude?: number[]; repeat?: number; }): void;
}

export const Module = (Platform.OS === 'android') ? NativeModules.ReactNativeMoVibrate as Module : undefined;
