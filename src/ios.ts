import { NativeModules, Platform } from 'react-native';

export enum VibrateType {
  ImpactLight = 'ImpactLight',
  ImpactMedium = 'ImpactMedium',
  ImpactHeavy = 'ImpactHeavy',
  NotificationError = 'NotificationError',
  NotificationWarning = 'NotificationWarning',
  NotificationSuccess = 'NotificationSuccess',
  SelectionChanged = 'SelectionChanged',
  System = 'System',
}

export interface Module {
  vibrate(type: VibrateType): void;
}

export const Module = (Platform.OS === 'ios') ? NativeModules.ReactNativeMoVibrate as Module : undefined;
