package de.mxs.reactnativemopushnotification;

import android.os.Handler;
import android.os.Looper;
import android.util.Log;

import com.facebook.react.ReactApplication;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;

import java.util.Map;

public final class ReactNativeMoPushNotificationFirebaseMessagingService extends FirebaseMessagingService {

    @Override
    public void onNewToken(String s) {
        super.onNewToken(s);
        Log.i("XXX", "onNewToken " + s);
    }

    @Override
    public void onMessageReceived(final RemoteMessage remoteMessage) {
        super.onMessageReceived(remoteMessage);
        Log.i("XXX", "onMessageReceived " + remoteMessage);
        Handler handler = new Handler(Looper.getMainLooper());
        handler.post(() -> {
            ReactInstanceManager reactInstanceManager = ((ReactApplication)getApplication()).getReactNativeHost().getReactInstanceManager();
            ReactContext context = reactInstanceManager.getCurrentReactContext();
            if (context != null) {
                handleMessage(remoteMessage, context);
            } else {
                Log.i("XXX", "create react context");
                reactInstanceManager.addReactInstanceEventListener(context1 -> {
                    Log.i("XXX", "context created");
                    handleMessage(remoteMessage, context1);
                });
                if (!reactInstanceManager.hasStartedCreatingInitialContext()) {
                    reactInstanceManager.createReactContextInBackground();
                }
            }
        });
    }

    private void handleMessage(RemoteMessage remoteMessage, ReactContext context) {
        WritableMap args = Arguments.createMap();
        args.putString("type", "onMessageReceived");
        args.putString("from", remoteMessage.getFrom());
        args.putString("to", remoteMessage.getTo());
        args.putString("messageId", remoteMessage.getMessageId());
        args.putString("messageType", remoteMessage.getMessageType());
        args.putString("collapseKey", remoteMessage.getCollapseKey());
        args.putDouble("sentTime", remoteMessage.getSentTime());
        args.putInt("priority", remoteMessage.getPriority());
        args.putInt("originalPriority", remoteMessage.getOriginalPriority());
        args.putInt("ttl", remoteMessage.getTtl());
        if (remoteMessage.getNotification() != null) {
            args.putString("body", remoteMessage.getNotification().getBody());
            args.putString("title", remoteMessage.getNotification().getTitle());
            args.putString("sound", remoteMessage.getNotification().getSound());
            args.putString("color", remoteMessage.getNotification().getColor());
            args.putString("icon", remoteMessage.getNotification().getIcon());
            args.putString("tag", remoteMessage.getNotification().getTag());
        }
        WritableMap data = Arguments.createMap();
        for (Map.Entry<String, String> entry : remoteMessage.getData().entrySet()) {
            data.putString(entry.getKey(), entry.getValue());
        }
        args.putMap("data", data);
        context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("ReactNativeMoPushNotification", args);
    }

}
