#import <UIKit/UIKit.h>
#import <React/RCTBridge.h>
#import <AudioToolbox/AudioToolbox.h>

@interface ReactNativeMoVibrate : NSObject <RCTBridgeModule>
@end

@implementation ReactNativeMoVibrate

RCT_EXPORT_MODULE()

// vibrate needs to be called from UI thread
- (dispatch_queue_t)methodQueue {
    return dispatch_get_main_queue();
}

RCT_EXPORT_METHOD(vibrate:(NSString*)type) {
    if (@available(iOS 10.0, *)) {
        
        if ([type isEqualToString:@"ImpactLight"]) {
            [[[UIImpactFeedbackGenerator alloc] initWithStyle:UIImpactFeedbackStyleLight] impactOccurred];
        } else if ([type isEqualToString:@"ImpactMedium"]) {
            [[[UIImpactFeedbackGenerator alloc] initWithStyle:UIImpactFeedbackStyleMedium] impactOccurred];
        } else if ([type isEqualToString:@"ImpactHeavy"]) {
            [[[UIImpactFeedbackGenerator alloc] initWithStyle:UIImpactFeedbackStyleHeavy] impactOccurred];

        } else if ([type isEqualToString:@"NotificationError"]) {
            [[[UINotificationFeedbackGenerator alloc] init] notificationOccurred:UINotificationFeedbackTypeError];
        } else if ([type isEqualToString:@"NotificationWarning"]) {
            [[[UINotificationFeedbackGenerator alloc] init] notificationOccurred:UINotificationFeedbackTypeWarning];
        } else if ([type isEqualToString:@"NotificationSuccess"]) {
            [[[UINotificationFeedbackGenerator alloc] init] notificationOccurred:UINotificationFeedbackTypeSuccess];

        } else if ([type isEqualToString:@"SelectionChanged"]) {
            [[[UISelectionFeedbackGenerator alloc] init] selectionChanged];

        } else if ([type isEqualToString:@"System"]) {
            AudioServicesPlayAlertSoundWithCompletion(kSystemSoundID_Vibrate, nil);

        }

    } else {
        AudioServicesPlayAlertSoundWithCompletion(kSystemSoundID_Vibrate, nil);

    }
}

@end
