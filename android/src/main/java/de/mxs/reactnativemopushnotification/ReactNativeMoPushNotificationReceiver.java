package de.mxs.reactnativemopushnotification;

import android.app.Notification;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;

import com.facebook.react.ReactApplication;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

public class ReactNativeMoPushNotificationReceiver extends BroadcastReceiver {

    private void sendEvent(ReactContext reactContext, Bundle bundle) {
        Bundle data = bundle.getBundle("data");
        Notification notification = bundle.getParcelable("notification");
        if (ReactNativeMoPushNotification.verbose) {
            Log.i("RNMoPushNotification", "Receiver.sendEvent");
            for (String k : bundle.keySet()) {
                Log.i("RNMoPushNotification", "[" + k + "] = " + bundle.get(k));
            }
            if (data != null) {
                for (String k : data.keySet()) {
                    Log.i("RNMoPushNotification", "[data." + k + "] = " + data.get(k));
                }
            }
            if (notification != null) {
                for (String k : notification.extras.keySet()) {
                    Log.i("RNMoPushNotification", "[notification.extras." + k + "] = " + notification.extras.get(k));
                }
            }
        }
        WritableMap args = Arguments.createMap();
        args.putString("type", "onNotificationClicked");
        args.putInt("id", bundle.getInt("id", 0));
        if (data != null) {
            args.putMap("data", Arguments.fromBundle(data));
        }
        if (bundle.containsKey("action")) {
            args.putString("action", bundle.getString("action"));
        }
        if (notification != null) {
            ReactNativeMoPushNotification.notificationToMap(notification, args);
        }
        reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("ReactNativeMoPushNotification", args);
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        if (ReactNativeMoPushNotification.verbose) {
            Log.i("RNMoPushNotification", "Receiver.onReceive " + intent);
        }
        Bundle bundle = intent.getBundleExtra("ReactNativeMoPushNotification");
        if (bundle != null) {
            if (ReactNativeMoPushNotification.verbose) {
                for (String k : bundle.keySet()) {
                    Log.i("RNMoPushNotification", "[bundle." + k + "] = " + bundle.get(k));
                }
            }

            ReactInstanceManager reactInstanceManager = ((ReactApplication) context.getApplicationContext()).getReactNativeHost().getReactInstanceManager();
            ReactContext reactContext = reactInstanceManager.getCurrentReactContext();
            if (reactContext != null) {
                sendEvent(reactContext, bundle);
            } else {
                reactInstanceManager.addReactInstanceEventListener(reactContextNew -> sendEvent(reactContextNew, bundle));
                if (!reactInstanceManager.hasStartedCreatingInitialContext()) {
                    reactInstanceManager.createReactContextInBackground();
                }
            }
        }
    }
}
