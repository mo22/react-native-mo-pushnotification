package de.mxs.reactnativemopushnotification;

import android.os.Handler;
import android.os.Looper;
import android.util.Log;

import androidx.annotation.NonNull;

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

    @SuppressWarnings({"WeakerAccess", "unused"})
    public static abstract class Hook {
        public void onMessageReceived(@NonNull RemoteMessage var1) {
        }
        public void onDeletedMessages() {
        }
        public void onMessageSent(@NonNull String var1) {
        }
        public void onSendError(@NonNull String var1, @NonNull Exception var2) {
        }
        public void onNewToken(@NonNull String var1) {
        }
    }

    private static Hook hook;

    public static void setHook(Hook val) {
        hook = val;
    }

    @Override
    public void onNewToken(@NonNull String s) {
        if (hook != null) hook.onNewToken(s);
        super.onNewToken(s);
        if (ReactNativeMoPushNotification.verbose) {
            Log.i("RNMoPushNotification", "onNewToken " + s);
        }
    }

    @Override
    public void onMessageReceived(final @NonNull RemoteMessage remoteMessage) {
        super.onMessageReceived(remoteMessage);
        if (hook != null) {
            hook.onMessageReceived(remoteMessage);
        }
        if (ReactNativeMoPushNotification.verbose) {
            Log.i("RNMoPushNotification", "onMessageReceived " + remoteMessage);
        }

        Handler handler = new Handler(Looper.getMainLooper());
        handler.post(() -> {
            ReactInstanceManager reactInstanceManager = ((ReactApplication)getApplication()).getReactNativeHost().getReactInstanceManager();
            ReactContext reactContext = reactInstanceManager.getCurrentReactContext();
            if (reactContext != null) {
                handleMessage(remoteMessage, reactContext);
            } else {
                reactInstanceManager.addReactInstanceEventListener(reactContextNew -> handleMessage(remoteMessage, reactContextNew));
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

    @Override
    public void onDeletedMessages() {
        super.onDeletedMessages();
        if (hook != null) {
            hook.onDeletedMessages();
        }
    }

    @Override
    public void onMessageSent(@NonNull String s) {
        super.onMessageSent(s);
        if (hook != null) {
            hook.onMessageSent(s);
        }
    }

    @Override
    public void onSendError(@NonNull String s, @NonNull Exception e) {
        super.onSendError(s, e);
        if (hook != null) {
            hook.onSendError(s, e);
        }
    }
}
