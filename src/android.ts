import { NativeModules, NativeEventEmitter, EmitterSubscription, Platform } from 'react-native';

export enum Importance {
  NONE = 0,
  MIN = 1,
  LOW = 2,
  DEFAULT = 3,
  HIGH = 4,
}

export enum Visibility {
  PRIVATE = 0,
  PUBLIC = 1,
  SECRET = -1,
}

export enum Priority {
  DEFAULT = 0,
  LOW = -1,
  MIN = -2,
  HIGH = 1,
  MAX = 2,
}

export interface Channel {
  id: string;
  name: string;
  importance: Importance;
  lockscreenVisibility: Visibility;
  lightColor: number;
  bypassDnd: boolean;
  sound: string;
}

export interface Notification {
  channelID?: string;
  title?: string;
  body?: string;
  vibrate?: number[];
  priority?: Priority;
  category?: 'call'|'navigation'|'msg'|'email'|'event'|'promo'|'alarm'|'progress'|'social'|'err'|'transport'|'sys'|'service'|'recommendation'|'status'|'reminder'|'car_emergency'|'car_warning'|'car_information';
  number?: number;
  colorized?: boolean;
  visibility?: Visibility;
  ticker?: string;
  subtext?: string;
  ongoing?: boolean;
  lights?: { color: number; on: number; off: number; };
  sound?: string;
  groupKey?: string;
  smallIcon?: string;
  autoCancel?: boolean;
  fullScreen?: boolean;
  turnScreenOn?: boolean;
  actions?: (
    ({
      title: string;
    } | {
      html: string;
    }) & {
      id: string;
      title?: string;
      html?: string;
      icon?: string;
      semanticAction?: number;
      allowGeneratedReplies?: boolean;
      showsUserInterface?: boolean;
      background?: boolean;
    })[];
  data?: { [k: string]: string|number|boolean };
}

export interface ExistingNotification {
  id: string;
  ongoing: boolean;
  postTime: number;
  color: number;
  number: number;
  title: string|null;
  subtext: string|null;
  body: string|null;
  channelID?: string;
  data: any;
}

export interface Module {
  setVerbose(verbose: boolean): void;
  setShortcutBadger(value: number): void;
  getFirebaseInstanceId(): Promise<string>;
  getSystemInfo(): Promise<{ locale: string; packageName: string; }>;
  createNotificationChannel(channel: Partial<Channel>): void;
  deleteNotificationChannel(id: string): void;
  openNotificationSettings(): void;
  openNotificationChannelSettings(id: string): void;
  getNotificationChannels(): Promise<Channel[]>;
  cancelNotification(id: number): void;
  getNotifications(): Promise<ExistingNotification[] | undefined>;
  showNotification(args: Notification): Promise<number>;
  startMainActivity(): void;
  acquireWakeLock(tag: string, timeout: number): Promise<string>;
  releaseWakeLock(key: string): void;
  testWorkManager(): void;
  setStartOnBoot(active: boolean): Promise<void>;
  scheduleWakeup(args: { time: number; test?: string; }): Promise<void>;
}

export type Event = {
  type: 'onMessageReceived';
  from: string|null;
  to: string|null;
  messageId: string;
  messageType?: string|null;
  collapseKey?: string|null;
  sentTime: number;
  priority: number;
  originalPriority: number;
  ttl: number;
  data: { [k: string]: string };
  title?: string|null;
  body?: string|null;
  sound?: string|null;
  color?: string|null;
  icon?: string|null;
  tag?: string|null;
} | {
  type: 'onNotificationClicked';
  id: number;
  action?: string;
  title: string|null;
  subtext: string|null;
  body: string|null;
  number?: number;
  color?: number;
  channelID?: string;
  data?: any;
} | {
  type: 'onNotificationIntent';
  from: string|null;
  collapseKey?: string|null;
  messageId: string;
  data: { [k: string]: string };
};

export const Module = (Platform.OS === 'android') ? NativeModules.ReactNativeMoPushNotification as Module : undefined;

export const Events = Module ? new NativeEventEmitter(NativeModules.ReactNativeMoPushNotification) as {
  addListener(eventType: 'ReactNativeMoPushNotification', listener: (event: Event) => void): EmitterSubscription;
} : undefined;
