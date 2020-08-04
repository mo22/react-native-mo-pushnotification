package de.mxs.reactnativemopushnotification;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

public class ReactNativeMoPushNotificationBootReceiver extends BroadcastReceiver  {
    @Override
    public void onReceive(Context context, Intent intent) {
        if (!Intent.ACTION_BOOT_COMPLETED.equals(intent.getAction())) return;
        Log.i("XXX", "ReactNativeMoPushNotificationBootReceiver.onReceive " + intent);
    }
}
