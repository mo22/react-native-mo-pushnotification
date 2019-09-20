package de.mxs.reactnativemopushnotification;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

public class ReactNativeMoPushNotificationReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        Log.i("XXX", "ReactNativeMoPushNotificationReceiver " + intent);
    }
}
