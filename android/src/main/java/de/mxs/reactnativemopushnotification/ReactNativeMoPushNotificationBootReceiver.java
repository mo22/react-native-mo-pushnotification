package de.mxs.reactnativemopushnotification;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;

import com.facebook.react.ReactApplication;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.bridge.ReactContext;

public class ReactNativeMoPushNotificationBootReceiver extends BroadcastReceiver  {

    @Override
    public void onReceive(Context context, Intent intent) {
        if (!Intent.ACTION_BOOT_COMPLETED.equals(intent.getAction())) return;

        if (ReactNativeMoPushNotification.verbose) {
            Log.i("RNMoPushNotification", "BootReceiver onReceive");
        }

        // @TODO: always?
        SharedPreferences sharedPreferences = context.getSharedPreferences("de.mxs.reactnativemopushnotification", Context.MODE_PRIVATE);
        if (!sharedPreferences.getBoolean("startOnBoot", false)) {
            return;
        }

        Handler handler = new Handler(Looper.getMainLooper());
        handler.post(() -> {
            ReactInstanceManager reactInstanceManager = ((ReactApplication)context.getApplicationContext()).getReactNativeHost().getReactInstanceManager();
            ReactContext reactContext = reactInstanceManager.getCurrentReactContext();
            if (reactContext == null) {
                if (!reactInstanceManager.hasStartedCreatingInitialContext()) {
                    reactInstanceManager.createReactContextInBackground();
                }
            }
        });
    }

}
