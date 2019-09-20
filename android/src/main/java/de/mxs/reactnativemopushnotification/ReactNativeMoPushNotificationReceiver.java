package de.mxs.reactnativemopushnotification;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

public class ReactNativeMoPushNotificationReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        Log.i("XXX", "ReactNativeMoPushNotificationReceiver " + intent);

        Intent launchIntent = context.getPackageManager().getLaunchIntentForPackage(context.getPackageName());
        if (launchIntent == null || launchIntent.getComponent() == null) throw new RuntimeException("launchIntent null");
        launchIntent.addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP);
        launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        launchIntent.putExtra("ReactNativeMoPushNotification", intent.getBundleExtra("ReactNativeMoPushNotification"));
        context.startActivity(launchIntent);
    }
}
