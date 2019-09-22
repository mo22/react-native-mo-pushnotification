#import <UIKit/UIKit.h>
#import <React/RCTEventEmitter.h>
#import <UserNotifications/UserNotifications.h>

@interface ReactNativeMoPushNotification : RCTEventEmitter

+ (BOOL)isDevEnvironment;

+ (BOOL)verbose;
+ (void)setVerbose:(BOOL)verbose;

+ (void)disableAutoSwizzle;

// forward these from your AppDelegate.m if you have disabled auto swizzling
+ (void)didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken;
+ (void)didFailToRegisterForRemoteNotificationsWithError:(NSError *)error;
+ (void)didReceiveRemoteNotification:(NSDictionary *)userInfo fetchCompletionHandler:(void (^)(UIBackgroundFetchResult))completionHandler;

// only forward these if you are handling the UNUserNotificationCenter delegate yourself
+ (void)willPresentNotification:(UNNotification *)notification withCompletionHandler:(void (^)(UNNotificationPresentationOptions))completionHandler;
+ (void)didReceiveNotificationResponse:(UNNotificationResponse *)response withCompletionHandler:(void(^)(void))completionHandler;

@end
