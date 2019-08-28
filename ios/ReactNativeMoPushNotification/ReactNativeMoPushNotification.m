#import <UIKit/UIKit.h>
#import <UserNotifications/UserNotifications.h>
#import "ReactNativeMoPushNotification.h"
#import <React/RCTUtils.h>
#import <PushKit/PushKit.h>
#import <objc/runtime.h>



static void methodSwizzle(Class cls1, Class cls2, SEL sel) {
    Method m1 = class_getInstanceMethod(cls1, sel);
    Method m2 = class_getInstanceMethod(cls2, sel);
    IMP m2i = method_getImplementation(m2);
    if (m1 == nil) {
        class_addMethod(cls1, sel, m2i, method_getTypeEncoding(m1));
    } else {
        method_exchangeImplementations(m1, m2);
    }
}



@interface ReactNativeMoPushNotificationDelegate : NSObject <UNUserNotificationCenterDelegate>
@end
@implementation ReactNativeMoPushNotificationDelegate

@end



static BOOL g_verbose;

static NSString* (^g_pushKitHandler)(PKPushPayload* payload);



@interface ReactNativeMoPushNotification () <UNUserNotificationCenterDelegate, PKPushRegistryDelegate>
@property (nonatomic, strong) NSMutableDictionary<NSString*, void (^)(id result)>* callbacks;
@property (nonatomic, strong) PKPushRegistry* pushRegistry;
@property BOOL verbose;
@end

@implementation ReactNativeMoPushNotification



RCT_EXPORT_MODULE()

+ (BOOL)requiresMainQueueSetup {
    return YES;
}

- (NSArray<NSString *> *)supportedEvents {
    return @[ @"ReactNativeMoPushNotification" ];
}

- (dispatch_queue_t)methodQueue {
    return dispatch_get_main_queue();
}



+ (bool)verbose {
    return g_verbose;
}
+ (void)setVerbose:(BOOL)verbose {
    g_verbose = verbose;
}

RCT_EXPORT_METHOD(setVerbose:(BOOL)verbose) {
    [[self class] setVerbose:verbose];
}
- (BOOL)verbose {
    return [[self class] verbose];
}





+ (void)setup {
    static id<UIApplicationDelegate> appDelegate;
    if (appDelegate == nil) {
        [self didFinishLaunchingWithOptions:nil];
        methodSwizzle([[RCTSharedApplication() delegate] class], [self class], @selector(application:didRegisterForRemoteNotificationsWithDeviceToken:));
        methodSwizzle([[RCTSharedApplication() delegate] class], [self class], @selector(application:didFailToRegisterForRemoteNotificationsWithError:));
        methodSwizzle([[RCTSharedApplication() delegate] class], [self class], @selector(application:didReceiveRemoteNotification:fetchCompletionHandler:));
        appDelegate = RCTSharedApplication().delegate;
        [UIApplication sharedApplication].delegate = nil;
        RCTSharedApplication().delegate = appDelegate;
    }
}



+ (NSMutableArray*)notificationQueue {
    static dispatch_once_t onceToken;
    static NSMutableArray* notificationQueue;
    dispatch_once(&onceToken, ^{
        notificationQueue = [NSMutableArray new];
    });
    return notificationQueue;
}

+ (void)addToNotificationQueue:(NSDictionary*)rs {
    if (self.verbose) NSLog(@"ReactNativeMoPushNotification.addToNotificationQueue %@", rs);
    [[self notificationQueue] addObject:rs];
    [[NSNotificationCenter defaultCenter] postNotificationName:@"ReactNativeMoPushNotification" object:nil userInfo:rs];
}



- (void)startObserving {
    while ([ReactNativeMoPushNotification notificationQueue].count > 0) {
        NSDictionary* rs = [[ReactNativeMoPushNotification notificationQueue] firstObject];
        [[ReactNativeMoPushNotification notificationQueue] removeObjectAtIndex:0];
        [self handle:rs];
    }
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(handleNotification:) name:@"ReactNativeMoPushNotification" object:nil];
}

- (void)stopObserving {
    [[NSNotificationCenter defaultCenter] removeObserver:self];
}

- (void)handleNotification:(NSNotification * _Nonnull)note {
    while ([ReactNativeMoPushNotification notificationQueue].count > 0) {
        NSDictionary* rs = [[ReactNativeMoPushNotification notificationQueue] firstObject];
        [[ReactNativeMoPushNotification notificationQueue] removeObjectAtIndex:0];
        [self handle:rs];
    }
}



- (NSString*)dataToHex:(NSData*)data {
    const unsigned char* bytes = data.bytes;
    NSMutableString* res = [NSMutableString new];
    for (int i=0; i<data.length; i++) {
        [res appendFormat:@"%02X", bytes[i]];
    }
    return res;
}



- (BOOL)isDevEnvironment {
    NSString* path = [[[NSBundle mainBundle] bundlePath] stringByAppendingPathComponent:@"embedded.mobileprovision"];
    NSString* tmp = [NSString stringWithContentsOfFile:path encoding:NSASCIIStringEncoding error:nil];
    if (tmp && [tmp containsString:@"<key>aps-environment</key>\n\t\t<string>development</string>"]) {
        return YES;
    }
    return NO;
}



- (NSString*)newCallbackWithBlock:(void (^)(id result))handler {
    NSString* key = [[NSUUID UUID] UUIDString];
    if (!self.callbacks) {
        self.callbacks = [NSMutableDictionary new];
    }
    self.callbacks[key] = handler;
    return key;
}

- (void)resolveCallback:(NSString*)key result:(id)result {
    if (self.verbose) NSLog(@"ReactNativeMoPushNotification.resolveCallback %@ (%@)", key, result);
    if (!self.callbacks) {
        return;
    }
    void (^handler)(id result) = [self.callbacks objectForKey:key];
    if (!handler) {
        return;
    }
    [self.callbacks removeObjectForKey:key];
    if (self.verbose) NSLog(@"ReactNativeMoPushNotification.resolveCallback %@ invoke (%@)", key, result);
    handler(result);
}



- (NSDictionary*)UNNotificationToDict:(UNNotification*)notification {
    NSMutableDictionary* rs = [NSMutableDictionary new];
    rs[@"date"] = @([notification.date timeIntervalSince1970]);
    rs[@"identifier"] = RCTNullIfNil(notification.request.identifier);
    rs[@"title"] = RCTNullIfNil(notification.request.content.title);
    rs[@"subtitle"] = RCTNullIfNil(notification.request.content.subtitle);
    rs[@"body"] = RCTNullIfNil(notification.request.content.body);
    rs[@"badge"] = RCTNullIfNil(notification.request.content.badge);
    rs[@"sound"] = RCTNullIfNil(notification.request.content.sound);
    rs[@"launchImageName"] = RCTNullIfNil(notification.request.content.launchImageName);
    rs[@"userInfo"] = RCTNullIfNil(RCTJSONClean(notification.request.content.userInfo));
    // attachments?
    if (@available(iOS 12.0, *)) {
        rs[@"summaryArgument"] = RCTNullIfNil(notification.request.content.summaryArgument);
        rs[@"summaryArgumentCount"] = @(notification.request.content.summaryArgumentCount);
    }
    rs[@"categoryIdentifier"] = RCTNullIfNil(notification.request.content.categoryIdentifier);
    rs[@"threadIdentifier"] = RCTNullIfNil(notification.request.content.threadIdentifier);
    // trigger?
    return rs;
}



- (void)handle:(NSDictionary*)rs {
    if (self.verbose) NSLog(@"ReactNativeMoPushNotification.handle %@", rs);
    
    if ([rs[@"type"] isEqualToString:@"didRegisterForRemoteNotificationsWithDeviceToken"]) {
        NSData* deviceToken = rs[@"deviceToken"];
        [self sendEventWithName:@"ReactNativeMoPushNotification" body:@{
            @"type": @"didRegisterForRemoteNotificationsWithDeviceToken",
            @"deviceToken": [self dataToHex:deviceToken],
            @"isDevEnvironment": @([self isDevEnvironment]),
            @"bundle": [[NSBundle mainBundle] bundleIdentifier],
            @"locale": [[NSLocale preferredLanguages] firstObject],
        }];
        
    } else if ([rs[@"type"] isEqualToString:@"didFailToRegisterForRemoteNotificationsWithError"]) {
        NSError* error = rs[@"error"];
        [self sendEventWithName:@"ReactNativeMoPushNotification" body:@{
            @"type": @"didFailToRegisterForRemoteNotificationsWithError",
            @"message": error.localizedDescription,
            @"code": @(error.code),
        }];
        
    } else if ([rs[@"type"] isEqualToString:@"didReceiveRemoteNotification"]) {
        void (^completionHandler)(UIBackgroundFetchResult) = rs[@"completionHandler"];
        NSString* __block callbackKey = [self newCallbackWithBlock:^(id result) {
            if (self.verbose) NSLog(@"ReactNativeMoPushNotification didReceiveRemoteNotification result %@", callbackKey);
            completionHandler([result intValue]);
        }];
        if (self.verbose) NSLog(@"ReactNativeMoPushNotification didReceiveRemoteNotification prep %@", callbackKey);
        [self sendEventWithName:@"ReactNativeMoPushNotification" body:@{
            @"type": @"didReceiveRemoteNotification",
            @"userInfo": rs[@"userInfo"],
            @"callbackKey": callbackKey,
        }];
        
    } else if ([rs[@"type"] isEqualToString:@"didReceiveNotificationResponse"]) {
        UNNotificationResponse* response = rs[@"response"];
        if (self.verbose) NSLog(@"ReactNativeMoPushNotification didReceiveNotificationResponse %@", response);
        if (self.verbose) NSLog(@"ReactNativeMoPushNotification didReceiveNotificationResponse userInfo %@", response.notification.request.content.userInfo);
        void (^completionHandler)(void) = rs[@"completionHandler"];
        NSString* callbackKey = [self newCallbackWithBlock:^(id result) {
            completionHandler();
        }];
        [self sendEventWithName:@"ReactNativeMoPushNotification" body:@{
            @"type": @"didReceiveNotificationResponse",
            @"notification": [self UNNotificationToDict:response.notification],
            @"actionIdentifier": response.actionIdentifier,
            @"callbackKey": callbackKey,
        }];

    } else if ([rs[@"type"] isEqualToString:@"willPresentNotification"]) {
        UNNotification* notification = rs[@"notification"];
        if (self.verbose) NSLog(@"ReactNativeMoPushNotification willPresentNotification %@", notification);
        void (^completionHandler)(UNNotificationPresentationOptions) = rs[@"completionHandler"];
//        completionHandler(UNNotificationPresentationOptionAlert | UNNotificationPresentationOptionSound | UNNotificationPresentationOptionBadge);
        NSString* callbackKey = [self newCallbackWithBlock:^(id result) {
            completionHandler([result intValue]);
        }];
        [self sendEventWithName:@"ReactNativeMoPushNotification" body:@{
            @"type": @"willPresentNotification",
            @"notification": [self UNNotificationToDict:notification],
            @"callbackKey": callbackKey,
        }];

    } else if ([rs[@"type"] isEqualToString:@"didUpdatePushCredentials"]) {
        PKPushCredentials* pushCredentials = rs[@"pushCredentials"];
        [self sendEventWithName:@"ReactNativeMoPushNotification" body:@{
            @"type": @"didUpdatePushCredentials",
            @"pushType": rs[@"pushType"],
            @"pushCredentials": [self dataToHex:pushCredentials.token],
            @"isDevEnvironment": @([self isDevEnvironment]),
            @"bundle": [[NSBundle mainBundle] bundleIdentifier],
            @"locale": [[NSLocale preferredLanguages] firstObject],
        }];

    } else if ([rs[@"type"] isEqualToString:@"didInvalidatePushToken"]) {
        [self sendEventWithName:@"ReactNativeMoPushNotification" body:@{
            @"type": @"didInvalidatePushToken",
            @"pushType": rs[@"pushType"],
        }];

    } else if ([rs[@"type"] isEqualToString:@"didReceiveIncomingPush"]) {
        void (^completionHandler)(void) = rs[@"completionHandler"];
        PKPushPayload* payload = rs[@"payload"];
        NSString* callbackKey = [self newCallbackWithBlock:^(id result) {
            completionHandler();
        }];
        
        NSString* extraKey = nil;
        if (g_pushKitHandler) {
            if (self.verbose) NSLog(@"ReactNativeMoPushNotification.handle call g_pushKitHandler");
            extraKey = g_pushKitHandler(payload);
        }
        
        [self sendEventWithName:@"ReactNativeMoPushNotification" body:@{
            @"type": @"didReceiveIncomingPush",
            @"pushType": rs[@"pushType"],
            @"payload": payload.dictionaryPayload,
            @"callbackKey": callbackKey,
            @"extraKey": RCTNullIfNil(extraKey),
        }];
        
        sleep(1);

    } else {
        NSLog(@"ReactNativeMoPushNotification received unknown %@", rs[@"type"]);
        
    }
}



RCT_EXPORT_METHOD(setApplicationIconBadgeNumber:(NSInteger)number) {
    RCTSharedApplication().applicationIconBadgeNumber = number;
}

RCT_EXPORT_METHOD(getApplicationIconBadgeNumber:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject) {
    resolve(@(RCTSharedApplication().applicationIconBadgeNumber));
}

RCT_EXPORT_METHOD(registerForRemoteNotifications) {
    [RCTSharedApplication() registerForRemoteNotifications];
}

RCT_EXPORT_METHOD(isRegisteredForRemoteNotifications:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject) {
    resolve(@( [RCTSharedApplication() isRegisteredForRemoteNotifications] ));
}

RCT_EXPORT_METHOD(requestAuthorization:(NSInteger)options resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject) {
    [[UNUserNotificationCenter currentNotificationCenter] requestAuthorizationWithOptions:options completionHandler:^(BOOL granted, NSError * _Nullable error) {
        if (granted) {
            resolve(nil);
        } else {
            reject(nil, nil, error);
        }
    }];
}

RCT_EXPORT_METHOD(getNotificationSettings:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject) {
    [[UNUserNotificationCenter currentNotificationCenter] getNotificationSettingsWithCompletionHandler:^(UNNotificationSettings * _Nonnull settings) {
        NSMutableDictionary* res = [NSMutableDictionary new];
        res[@"authorizationStatus"] = @( settings.authorizationStatus );
        res[@"soundSetting"] = @( settings.soundSetting );
        res[@"badgeSetting"] = @( settings.badgeSetting );
        res[@"alertSetting"] = @( settings.alertSetting );
        res[@"notificationCenterSetting"] = @( settings.notificationCenterSetting );
        res[@"lockScreenSetting"] = @( settings.lockScreenSetting );
        res[@"carPlaySetting"] = @( settings.carPlaySetting );
        res[@"alertStyle"] = @( settings.alertStyle );
        if (@available(iOS 11.0, *)) {
            res[@"showPreviewsSetting"] = @( settings.showPreviewsSetting );
        }
        if (@available(iOS 12.0, *)) {
            res[@"criticalAlertSetting"] = @( settings.criticalAlertSetting );
            res[@"providesAppNotificationSettings"] = @( settings.providesAppNotificationSettings );
        }
        resolve(res);
    }];
}

RCT_EXPORT_METHOD(removeDeliveredNotifications:(NSArray<NSString*>*)identifiers)
{
    [[UNUserNotificationCenter currentNotificationCenter] removeDeliveredNotificationsWithIdentifiers:identifiers];
}

RCT_EXPORT_METHOD(getDeliveredNotifications:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
{
    [[UNUserNotificationCenter currentNotificationCenter] getDeliveredNotificationsWithCompletionHandler:^(NSArray<UNNotification *> * _Nonnull notifications) {
        NSMutableArray<NSDictionary*>* res = [NSMutableArray new];
        for (UNNotification* notification in notifications) {
            [res addObject:[self UNNotificationToDict:notification]];
        }
        resolve(res);
    }];
}

RCT_EXPORT_METHOD(invokeCallback:(NSString*)key result:(id)result) {
    [self resolveCallback:key result:result];
}

RCT_EXPORT_METHOD(beginBackgroundTask:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject) {
    UIBackgroundTaskIdentifier __block task = [RCTSharedApplication() beginBackgroundTaskWithExpirationHandler:^{
        if (self.verbose) NSLog(@"ReactNativeMoPushNotification expireBackgroundTask %lu", (unsigned long)task);
        [RCTSharedApplication() endBackgroundTask:task];
        task = UIBackgroundTaskInvalid;
    }];
    NSString* callbackKey = [self newCallbackWithBlock:^(id result) {
        if (self.verbose) NSLog(@"ReactNativeMoPushNotification endBackgroundTask %lu", (unsigned long)task);
        [RCTSharedApplication() endBackgroundTask:task];
        task = UIBackgroundTaskInvalid;
    }];
    if (self.verbose) NSLog(@"ReactNativeMoPushNotification.beginBackgroundTask %lu %@", (unsigned long)task, callbackKey);
    resolve(callbackKey);
}

RCT_EXPORT_METHOD(endBackgroundTask:(NSString*)callbackKey) {
    if (self.verbose) NSLog(@"ReactNativeMoPushNotification.endBackgroundTask %@", callbackKey);
    [self resolveCallback:callbackKey result:nil];
}

RCT_EXPORT_METHOD(openNotificationSettings) {
    // not directly the notification details...
    [[UIApplication sharedApplication] openURL:[NSURL URLWithString:UIApplicationOpenSettingsURLString] options:@{} completionHandler:nil];
}

RCT_EXPORT_METHOD(showNotification:(NSDictionary*)args resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject) {
    if (self.verbose) NSLog(@"ReactNativeMoPushNotification.showNotification %@", args);

    UNMutableNotificationContent* content = [UNMutableNotificationContent new];
    if (args[@"body"]) {
        content.body = args[@"body"];
    }
    if (args[@"categoryIdentifier"]) {
        content.categoryIdentifier = args[@"categoryIdentifier"];
    }
    if (args[@"sound"]) {
        if ([args[@"sound"] isEqualToString:@"default"]) {
            content.sound = [UNNotificationSound defaultSound];
        } else if ([args[@"sound"] isEqualToString:@"defaultCritical"]) {
            if (@available(iOS 12.0, *)) {
                content.sound = [UNNotificationSound defaultCriticalSound];
            } else {
                content.sound = [UNNotificationSound defaultSound];
            }
        } else {
            content.sound = [UNNotificationSound soundNamed:args[@"sound"]];
        }
    }
    if (args[@"subtitle"]) {
        content.subtitle = args[@"subtitle"];
    }
    if (args[@"threadIdentifier"]) {
        content.threadIdentifier = args[@"threadIdentifier"];
    }
    if (args[@"title"]) {
        content.title = args[@"title"];
    }
    if (args[@"userInfo"]) {
        content.userInfo = args[@"userInfo"];
    }
    if (args[@"badge"]) {
        content.badge = args[@"badge"];
    }
    if (self.verbose) NSLog(@"ReactNativeMoPushNotification showNotification content %@", content);

    UNNotificationRequest* request = [UNNotificationRequest requestWithIdentifier:args[@"id"] content:content trigger:nil];

    [[UNUserNotificationCenter currentNotificationCenter] addNotificationRequest:request withCompletionHandler:^(NSError * _Nullable error) {
        if (error) {
            reject(@"error", @"error", error);
        } else {
            resolve(nil);
        }
    }];
}

RCT_EXPORT_METHOD(setupCategories:(NSArray<NSDictionary*>*)rsCategories) {
    // categories: { identifier: string; options: number; actions: { identifier: string; title: string; options: number; }[]; }[]
    NSMutableSet* categories = [NSMutableSet new];
    for (NSDictionary* rsCategory in rsCategories) {
        NSString* identifier = rsCategory[@"identifier"];
        NSArray<NSString*>* intentIdentifiers = rsCategory[@"intentIdentifiers"];
        UNNotificationCategoryOptions options = [rsCategory[@"options"] intValue];
        NSMutableArray* actions = [NSMutableArray new];
        for (NSDictionary* rsAction in rsCategory[@"actions"]) {
            NSString* identifier = rsAction[@"identifier"];
            NSString* title = rsAction[@"title"];
            UNNotificationActionOptions options = [rsAction[@"options"] intValue];
            [actions addObject:[UNNotificationAction
                actionWithIdentifier:identifier
                title:title
                options:options
            ]];
        }
        [categories addObject:[UNNotificationCategory
            categoryWithIdentifier:identifier
            actions:actions
            intentIdentifiers:intentIdentifiers
            options:options
        ]];
    }
    [[UNUserNotificationCenter currentNotificationCenter] setNotificationCategories:categories];
}

RCT_EXPORT_METHOD(pushKitInit:(NSArray*)types) {
    if (self.verbose) NSLog(@"ReactNativeMoPushNotification.pushKitInit %@", types);
    self.pushRegistry = [[PKPushRegistry alloc] initWithQueue:nil];
    self.pushRegistry.desiredPushTypes = [NSSet setWithArray:types];
    self.pushRegistry.delegate = self;
}




+ (void)didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
    if (![UNUserNotificationCenter currentNotificationCenter].delegate) {
        static ReactNativeMoPushNotification* staticDelegate;
        staticDelegate = [ReactNativeMoPushNotification new];
        [UNUserNotificationCenter currentNotificationCenter].delegate = staticDelegate;
    }
}

+ (void)didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken {
    [self addToNotificationQueue:@{
        @"type": @"didRegisterForRemoteNotificationsWithDeviceToken",
        @"deviceToken": deviceToken,
    }];
}

+ (void)didFailToRegisterForRemoteNotificationsWithError:(NSError *)error {
    [self addToNotificationQueue:@{
        @"type": @"didFailToRegisterForRemoteNotificationsWithError",
        @"error": error,
    }];
}

+ (void)didReceiveRemoteNotification:(NSDictionary *)userInfo fetchCompletionHandler:(void (^)(UIBackgroundFetchResult))completionHandler {
    [self addToNotificationQueue:@{
        @"type": @"didReceiveRemoteNotification",
        @"userInfo": userInfo,
        @"completionHandler": completionHandler,
    }];
}



- (void)userNotificationCenter:(UNUserNotificationCenter *)center willPresentNotification:(UNNotification *)notification withCompletionHandler:(void (^)(UNNotificationPresentationOptions))completionHandler {
    [ReactNativeMoPushNotification willPresentNotification:notification withCompletionHandler:completionHandler];
}

- (void)userNotificationCenter:(UNUserNotificationCenter *)center didReceiveNotificationResponse:(UNNotificationResponse *)response withCompletionHandler:(void (^)(void))completionHandler {
    [ReactNativeMoPushNotification didReceiveNotificationResponse:response withCompletionHandler:completionHandler];
}



+ (void)willPresentNotification:(UNNotification *)notification withCompletionHandler:(void (^)(UNNotificationPresentationOptions))completionHandler {
    [self addToNotificationQueue:@{
        @"type": @"willPresentNotification",
        @"notification": notification,
        @"completionHandler": completionHandler,
    }];
}

+ (void)didReceiveNotificationResponse:(UNNotificationResponse *)response withCompletionHandler:(void (^)(void))completionHandler {
    [self addToNotificationQueue:@{
        @"type": @"didReceiveNotificationResponse",
        @"response": response,
        @"completionHandler": completionHandler,
    }];
}

+ (void)setPushKitHandler:(NSString*(^)(PKPushPayload* payload))handler {
    g_pushKitHandler = handler;
}

// pushRegistry delegate
- (void)pushRegistry:(PKPushRegistry *)registry didUpdatePushCredentials:(PKPushCredentials *)pushCredentials forType:(PKPushType)type {
    if (self.verbose) NSLog(@"ReactNativeMoPushNotification.didUpdatePushCredentials %@ %@", pushCredentials, type);
    [ReactNativeMoPushNotification addToNotificationQueue:@{
        @"type": @"didUpdatePushCredentials",
        @"pushCredentials": pushCredentials,
        @"pushType": type,
    }];
}

- (void)pushRegistry:(PKPushRegistry *)registry didInvalidatePushTokenForType:(PKPushType)type {
    if (self.verbose) NSLog(@"ReactNativeMoPushNotification.didInvalidatePushTokenForType %@", type);
    [ReactNativeMoPushNotification addToNotificationQueue:@{
        @"type": @"didInvalidatePushToken",
        @"pushType": type,
    }];
}

- (void)pushRegistry:(PKPushRegistry *)registry didReceiveIncomingPushWithPayload:(PKPushPayload *)payload forType:(PKPushType)type withCompletionHandler:(void (^)(void))completion {
    if (self.verbose) NSLog(@"ReactNativeMoPushNotification.didReceiveIncomingPushWithPayload %@ %@", payload, type);
    [ReactNativeMoPushNotification addToNotificationQueue:@{
        @"type": @"didReceiveIncomingPush",
        @"payload": payload,
        @"pushType": type,
        @"completionHandler": completion,
    }];
}

// swizzled
- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken {
    [ReactNativeMoPushNotification didRegisterForRemoteNotificationsWithDeviceToken:deviceToken];
}

- (void)application:(UIApplication *)application didFailToRegisterForRemoteNotificationsWithError:(NSError *)error {
    [ReactNativeMoPushNotification didFailToRegisterForRemoteNotificationsWithError:error];
}

- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo fetchCompletionHandler:(void (^)(UIBackgroundFetchResult))completionHandler {
    [ReactNativeMoPushNotification didReceiveRemoteNotification:userInfo fetchCompletionHandler:completionHandler];
}

@end
