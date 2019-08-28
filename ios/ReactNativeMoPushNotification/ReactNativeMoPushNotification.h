#import <UIKit/UIKit.h>
#import <React/RCTEventEmitter.h>
#import <UserNotifications/UserNotifications.h>
#import <PushKit/PushKit.h>

@interface ReactNativeMoPushNotification : RCTEventEmitter

// do the setup automagically
+ (void)setup;

// forward these from your AppDelegate.m
+ (void)didFinishLaunchingWithOptions:(NSDictionary *)launchOptions;
+ (void)didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken;
+ (void)didFailToRegisterForRemoteNotificationsWithError:(NSError *)error;
+ (void)didReceiveRemoteNotification:(NSDictionary *)userInfo fetchCompletionHandler:(void (^)(UIBackgroundFetchResult))completionHandler;

// only forward these if you are handling the UNUserNotificationCenter delegate yourself
+ (void)willPresentNotification:(UNNotification *)notification withCompletionHandler:(void (^)(UNNotificationPresentationOptions))completionHandler;
+ (void)didReceiveNotificationResponse:(UNNotificationResponse *)response withCompletionHandler:(void(^)(void))completionHandler;

// set instant-handler for pushkit voip notifications
+ (void)setPushKitHandler:(NSString*(^)(PKPushPayload* payload))handler;

@end
