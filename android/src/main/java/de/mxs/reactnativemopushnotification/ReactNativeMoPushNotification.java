package de.mxs.reactnativemopushnotification;

import android.annotation.TargetApi;
import android.app.Activity;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.ContentResolver;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.content.res.Resources;
import android.media.AudioAttributes;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.PowerManager;
import android.provider.Settings;
import android.service.notification.StatusBarNotification;
import androidx.core.app.NotificationCompat;
import androidx.core.os.ConfigurationCompat;
import androidx.core.text.HtmlCompat;

import android.util.Log;

import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableType;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.google.firebase.iid.FirebaseInstanceId;

import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;

import javax.annotation.Nonnull;

import me.leolin.shortcutbadger.ShortcutBadger;

public class ReactNativeMoPushNotification extends ReactContextBaseJavaModule implements ActivityEventListener, LifecycleEventListener {

    private static int notificationIDCounter = 1;
    private HashMap<String, PowerManager.WakeLock> wakeLocks = new HashMap<>();
    static boolean verbose = false;

    ReactNativeMoPushNotification(ReactApplicationContext reactContext) {
        super(reactContext);
        reactContext.addActivityEventListener(this);
        reactContext.addLifecycleEventListener(this);

        Activity activity = getReactApplicationContext().getCurrentActivity();
        if (activity != null) {
            Intent intent = activity.getIntent();
            this.onNewIntent(intent);
        }
    }

    private void readableMapToBundle(ReadableMap a, Bundle b) {
        if (a == null) return;
        for (Map.Entry<String,Object> i : a.toHashMap().entrySet()) {
            if (i.getValue() instanceof String) {
                b.putString(i.getKey(), (String)i.getValue());
            } else if (i.getValue() instanceof Float) {
                b.putFloat(i.getKey(), (Float)i.getValue());
            } else if (i.getValue() instanceof Double) {
                b.putDouble(i.getKey(), (Double)i.getValue());
            } else if (i.getValue() instanceof Long) {
                b.putLong(i.getKey(), (Long)i.getValue());
            } else if (i.getValue() instanceof Integer) {
                b.putInt(i.getKey(), (Integer)i.getValue());
            } else if (i.getValue() instanceof Boolean) {
                b.putBoolean(i.getKey(), (Boolean)i.getValue());
            } else {
                Log.i("RNMoPushNotification", "cannot convert " + i.getValue());
            }
        }
    }

    @TargetApi(Build.VERSION_CODES.KITKAT)
    static void notificationToMap(Notification notification, WritableMap rs) {
        Bundle extras = notification.extras;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            rs.putInt("color", notification.color);
        }
        rs.putInt("number", notification.number);
        rs.putString("title", extras.getString("android.title"));
        rs.putString("subtext", extras.getString("android.subText"));
        rs.putString("body", extras.getString("android.text"));
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            rs.putString("channelID", notification.getChannelId());
        }
        WritableMap data = Arguments.createMap();
        for (String k : extras.keySet()) {
            if (k.startsWith("google.") || k.startsWith("android.") || k.equals("from") || k.equals("collapse_key")) continue;
            Object v = extras.get(k);
            if (v instanceof String) {
                data.putString(k, (String)v);
            } else if (v instanceof Double) {
                data.putDouble(k, (Double)v);
            } else if (v instanceof Float) {
                data.putDouble(k, (Float)v);
            } else if (v instanceof Long) {
                data.putDouble(k, (Long)v);
            } else if (v instanceof Integer) {
                data.putInt(k, (Integer)v);
            } else if (v instanceof Boolean) {
                data.putBoolean(k, (Boolean) v);
            } else if (v == null) {
                data.putNull(k);
            } else {
                data.putString(k, v.toString());
                // sub bundle etc.?
            }
        }
        rs.putMap("data", data);
    }

    @Nonnull
    @Override
    public String getName() {
        return "ReactNativeMoPushNotification";
    }

    @SuppressWarnings("unused")
    @ReactMethod
    public void setVerbose(boolean value) {
        verbose = value;
    }

    @SuppressWarnings("unused")
    @ReactMethod
    public void setShortcutBadger(int number) {
        try {
            ShortcutBadger.applyCount(getReactApplicationContext(), number);
        } catch (Exception e) {
            // ignore
        }
    }

    @SuppressWarnings("unused")
    @ReactMethod
    public void getFirebaseInstanceId(final Promise promise) {
        FirebaseInstanceId.getInstance().getInstanceId().addOnSuccessListener(
                instanceIdResult -> promise.resolve(instanceIdResult.getToken())
        ).addOnFailureListener(promise::reject);
    }

    @SuppressWarnings("unused")
    @ReactMethod
    public void getSystemInfo(final Promise promise) {
        NotificationManager notificationManager = (NotificationManager)getReactApplicationContext().getSystemService(Context.NOTIFICATION_SERVICE);
        if (notificationManager == null) return;
        Locale locale = ConfigurationCompat.getLocales(getReactApplicationContext().getResources().getConfiguration()).get(0);
        WritableMap res = Arguments.createMap();
        res.putString("packageName", getReactApplicationContext().getPackageName());
        res.putString("locale", locale.getLanguage() + "-" + locale.getCountry());
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            res.putBoolean("notificationsEnabled", notificationManager.areNotificationsEnabled());
        }
        promise.resolve(res);
    }

    @SuppressWarnings("unused")
    @ReactMethod
    public void createNotificationChannel(ReadableMap args) {
        if (verbose) Log.i("RNMoPushNotification", "createNotificationChannel args=" + args);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            Resources resources = getReactApplicationContext().getResources();
            String packageName = getReactApplicationContext().getPackageName();
            String id = args.getString("id");
            NotificationManager notificationManager = (NotificationManager)getReactApplicationContext().getSystemService(Context.NOTIFICATION_SERVICE);
            if (notificationManager == null) return;
            NotificationChannel channel = notificationManager.getNotificationChannel(id);
            if (channel == null) {
                channel = new NotificationChannel(id, id, NotificationManager.IMPORTANCE_NONE);
            }
            channel.setName(args.getString("name"));
            if (args.hasKey("importance") && args.getType("importance") == ReadableType.Number) {
                channel.setImportance(args.getInt("importance"));
            } else {
                channel.setImportance(NotificationManager.IMPORTANCE_HIGH);
            }
            if (args.hasKey("lockscreenVisibility") && args.getType("lockscreenVisibility") == ReadableType.Number) {
                channel.setLockscreenVisibility(args.getInt("lockscreenVisibility"));
            }
            if (args.hasKey("bypassDnd") && args.getType("bypassDnd") == ReadableType.Boolean) {
                channel.setBypassDnd(args.getBoolean("bypassDnd"));
            }
            if (args.hasKey("lightColor") && args.getType("lightColor") == ReadableType.Number) {
                channel.setLightColor(args.getInt("lightColor"));
            }
            if (args.hasKey("sound") && args.getType("sound") == ReadableType.String) {
                if ("default".equals(args.getString("sound"))) {
                    channel.setSound(
                            RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION),
                            new AudioAttributes.Builder()
                                    .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                                    .setUsage(AudioAttributes.USAGE_NOTIFICATION)
                                    .build()
                    );

                } else {
                    int soundID = resources.getIdentifier(args.getString("sound"), "raw", packageName);
                    channel.setSound(
                            Uri.parse(ContentResolver.SCHEME_ANDROID_RESOURCE + "://" + packageName + "/" + soundID),
                            new AudioAttributes.Builder()
                                    .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                                    .setUsage(AudioAttributes.USAGE_NOTIFICATION)
                                    .build()
                    );
                }
            } else {
                channel.setSound(null, null);
            }
            notificationManager.createNotificationChannel(channel);
        }
    }

    @SuppressWarnings("unused")
    @ReactMethod
    public void deleteNotificationChannel(String id) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager notificationManager = (NotificationManager) getReactApplicationContext().getSystemService(Context.NOTIFICATION_SERVICE);
            if (notificationManager == null) return;
            notificationManager.deleteNotificationChannel(id);
        }
    }

    @SuppressWarnings("unused")
    @ReactMethod
    public void openNotificationSettings() {
        Activity activity = getReactApplicationContext().getCurrentActivity();
        if (activity == null) return;
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
            Intent intent = new Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS);
            intent.putExtra(Settings.EXTRA_APP_PACKAGE, getReactApplicationContext().getPackageName());
            activity.startActivity(intent);
        } else if (android.os.Build.VERSION.SDK_INT == Build.VERSION_CODES.KITKAT) {
            Intent intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
            intent.addCategory(Intent.CATEGORY_DEFAULT);
            intent.setData(Uri.parse("package:" + getReactApplicationContext().getPackageName()));
            activity.startActivity(intent);
        }
    }

    @SuppressWarnings("unused")
    @ReactMethod
    public void openNotificationChannelSettings(String id) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            Intent intent = new Intent(Settings.ACTION_CHANNEL_NOTIFICATION_SETTINGS);
            intent.putExtra(Settings.EXTRA_APP_PACKAGE, getReactApplicationContext().getPackageName());
            intent.putExtra(Settings.EXTRA_CHANNEL_ID, id);
            getReactApplicationContext().startActivity(intent);
        }
    }

    @SuppressWarnings("unused")
    @ReactMethod
    public void getNotificationChannels(Promise promise) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager notificationManager = Objects.requireNonNull((NotificationManager)getReactApplicationContext().getSystemService(Context.NOTIFICATION_SERVICE));
            WritableArray res = Arguments.createArray();
            for (NotificationChannel channel : notificationManager.getNotificationChannels()) {
                WritableMap rs = Arguments.createMap();
                rs.putString("id", channel.getId());
                rs.putString("name", channel.getName().toString());
                rs.putInt("importance", channel.getImportance());
                rs.putInt("lockscreenVisibility", channel.getLockscreenVisibility());
                rs.putInt("lightColor", channel.getLightColor());
                rs.putBoolean("bypassDnd", channel.canBypassDnd());
                rs.putString("sound", channel.getSound().toString());
                res.pushMap(rs);
            }
            promise.resolve(res);
        }
    }

    @SuppressWarnings("unused")
    @ReactMethod
    public void cancelNotification(int id) {
//        Log.i("XXX", "cancelNotification " + id);
        NotificationManager notificationManager = Objects.requireNonNull((NotificationManager)getReactApplicationContext().getSystemService(Context.NOTIFICATION_SERVICE));
        notificationManager.cancel(id);
        notificationManager.cancel("test-tag", id); // this works?!
    }

    @SuppressWarnings("unused")
    @ReactMethod
    public void getNotifications(Promise promise) {
        NotificationManager notificationManager = Objects.requireNonNull((NotificationManager)getReactApplicationContext().getSystemService(Context.NOTIFICATION_SERVICE));
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            WritableArray res = Arguments.createArray();
            for (StatusBarNotification item : notificationManager.getActiveNotifications()) {
                Notification notification = item.getNotification();
                WritableMap rs = Arguments.createMap();
                rs.putInt("id", item.getId()); // returns 0 sometimes... then cancelNotification does not work...
                rs.putBoolean("ongoing", !item.isClearable());
                rs.putDouble("postTime", item.getPostTime());
//                Log.i("XXX", "getNotifications---- " + item.getId() + " " + item.getTag());
//                Bundle extras = notification.extras;
//                for (String k : extras.keySet()) {
//                    Log.i("XXX", "getNotifications extras " + k + " " + extras.get(k));
//                    // no notification data fields here...
//                }
//                Log.i("XXX", "getNotifications contentIntent " + notification.contentIntent);
//                if (notification.contentIntent != null) {
//                    try {
//                        Method getIntent = PendingIntent.class.getDeclaredMethod("getIntent");
//                        Intent intent = (Intent)getIntent.invoke(notification.contentIntent);
//                        Log.i("XXX", "getNotifications intent " + intent);
//                    } catch (Exception e) {
//                        e.printStackTrace();
//                    }
//                }
                notificationToMap(notification, rs);
                res.pushMap(rs);
            }
            promise.resolve(res);
        } else {
            if (verbose) Log.i("RNMoPushNotification", "getNotifications not supported on this platform");
            promise.resolve(null);
        }
    }

    private Bundle createBundleForNotification(ReadableMap args, NotificationCompat.Builder builder, int notificationID) {
        Bundle bundle = new Bundle();
        bundle.putInt("id", notificationID);
        if (args.hasKey("data")) {
            ReadableMap a = args.getMap("data");
            if (a != null) {
                Bundle b = new Bundle();
                this.readableMapToBundle(a, b);
                bundle.putBundle("data", b);
            }
        }
        bundle.putParcelable("notification", builder.build()); // ??
        return bundle;
    }

    private PendingIntent createPendingIntent(Bundle bundle) {
        Intent intent = new Intent(getReactApplicationContext(), ReactNativeMoPushNotificationReceiver.class);
        intent.putExtra("ReactNativeMoPushNotification", bundle);
        return PendingIntent.getBroadcast(getReactApplicationContext(), 0, intent, 0);
    }

    @SuppressWarnings("unused")
    @ReactMethod
    public void showNotification(ReadableMap args, Promise promise) throws Exception {
        NotificationManager notificationManager = Objects.requireNonNull((NotificationManager)getReactApplicationContext().getSystemService(Context.NOTIFICATION_SERVICE));
        Resources resources = getReactApplicationContext().getResources();
        String packageName = getReactApplicationContext().getPackageName();

        int notificationID = notificationIDCounter++;

        String channelID = args.hasKey("channelID") ? args.getString("channelID") : null;
        if (channelID == null) {
            ApplicationInfo ai = getReactApplicationContext().getPackageManager().getApplicationInfo(getReactApplicationContext().getPackageName(), PackageManager.GET_META_DATA);
            channelID = ai.metaData.getString("com.google.firebase.messaging.default_notification_channel_id", null);
            if (channelID != null && verbose) Log.i("RNMoPushNotification", "showNotification firebase default channelID");
        }
        if (channelID == null) {
            if (verbose) Log.i("RNMoPushNotification", "showNotification using default channelID");
            channelID = "default";
        }

        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
            if (notificationManager.getNotificationChannel(channelID) == null) {
                NotificationChannel channel;
                channel = new NotificationChannel(channelID, channelID, NotificationManager.IMPORTANCE_HIGH);
                channel.setName("default");
                channel.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
                notificationManager.createNotificationChannel(channel);
            }
        }

        NotificationCompat.Builder builder = new NotificationCompat.Builder(getReactApplicationContext(), channelID);
        if (args.hasKey("title")) {
            builder.setContentTitle(args.getString("title"));
        }
        if (args.hasKey("body")) {
            builder.setContentText(args.getString("body"));
        }
        if (args.hasKey("vibrate")) {
            ReadableArray vibrate = args.getArray("vibrate");
            if (vibrate != null) {
                long[] pattern = new long[vibrate.size()];
                for (int i=0; i<vibrate.size(); i++) pattern[i] = vibrate.getInt(i);
                builder.setVibrate(pattern);
            }
        }
        if (args.hasKey("priority")) {
            builder.setPriority(args.getInt("priority"));
        } else {
            builder.setPriority(NotificationCompat.PRIORITY_HIGH);
        }
        if (args.hasKey("category")) {
            builder.setCategory(args.getString("category"));
        }
        if (args.hasKey("number")) {
            builder.setNumber(args.getInt("number"));
        }
        if (args.hasKey("colorized")) {
            builder.setColorized(args.getBoolean("colorized"));
        }
        if (args.hasKey("visibility")) {
            builder.setVisibility(args.getInt("visibility"));
        } else {
            builder.setVisibility(NotificationCompat.VISIBILITY_PUBLIC);
        }
        if (args.hasKey("ticker")) {
            builder.setTicker(args.getString("ticker"));
        }
        if (args.hasKey("subtext")) {
            builder.setSubText(args.getString("subtext"));
        }
        if (args.hasKey("ongoing")) {
            builder.setOngoing(args.getBoolean("ongoing"));
        }
        if (args.hasKey("lights")) {
            ReadableMap a = args.getMap("lights");
            if (a != null) {
                builder.setLights(a.getInt("color"), a.getInt("on"), a.getInt("off"));
            }
        }
        if (args.hasKey("sound")) {
            if ("default".equals(args.getString("sound"))) {
                builder.setSound( RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION) );
            } else {
                int soundID = resources.getIdentifier(args.getString("sound"), "raw", packageName);
                builder.setSound( Uri.parse(ContentResolver.SCHEME_ANDROID_RESOURCE + "://" + packageName + "/" + soundID) );
            }
        }
        if (args.hasKey("groupKey")) {
            builder.setGroup(args.getString("groupKey"));
        }
        if (args.hasKey("data")) {
            Bundle extras = new Bundle();
            ReadableMap a = args.getMap("data");
            this.readableMapToBundle(a, extras);
            builder.setExtras(extras);
        }
        if (args.hasKey("smallIcon")) {
            int iconID = resources.getIdentifier(args.getString("smallIcon"), "mipmap", packageName);
            builder.setSmallIcon(iconID);
        } else {
            int iconID = resources.getIdentifier("ic_launcher", "mipmap", packageName);
            builder.setSmallIcon(iconID);
        }
        if (args.hasKey("autoCancel")) {
            builder.setAutoCancel(args.getBoolean("autoCancel"));
        } else {
            builder.setAutoCancel(true); // removed if tapped
        }

        {
            Bundle bundle = createBundleForNotification(args, builder, notificationID);
            builder.setContentIntent(createPendingIntent(bundle));
        }

        if (args.hasKey("fullScreen") && args.getBoolean("fullScreen")) {
            Bundle bundle = createBundleForNotification(args, builder, notificationID);
            bundle.putString("action", "fullScreen");
            PendingIntent pendingIntent = createPendingIntent(bundle);
            builder.setFullScreenIntent(pendingIntent, true);
        }

        if (args.hasKey("actions")) {
            ReadableArray actions = Objects.requireNonNull(args.getArray("actions"));
            for (int i=0; i<actions.size(); i++) {
                ReadableMap action = Objects.requireNonNull(actions.getMap(i));
                Bundle bundle = createBundleForNotification(args, builder, notificationID);
                if (action.hasKey("background")) {
                    bundle.putBoolean("background", action.getBoolean("background"));
                }
                bundle.putString("action", Objects.requireNonNull(action.getString("id")));
                PendingIntent pendingIntent = createPendingIntent(bundle);
                int iconID = resources.getIdentifier("ic_launcher", "mipmap", packageName);
                if (action.hasKey("icon")) {
                    iconID = resources.getIdentifier(action.getString("icon"), "mipmap", packageName);
                }
                CharSequence title;
                if (action.hasKey("html")) {
                    title = HtmlCompat.fromHtml(Objects.requireNonNull(action.getString("html")), HtmlCompat.FROM_HTML_MODE_LEGACY);
                } else {
                    title = Objects.requireNonNull(action.getString("title"));
                }
                NotificationCompat.Action.Builder actionBuilder = new NotificationCompat.Action.Builder(
                        iconID,
                        title,
                        pendingIntent
                );
                if (action.hasKey("semanticAction")) {
                    actionBuilder.setSemanticAction(action.getInt("semanticAction"));
                }
                if (action.hasKey("allowGeneratedReplies")) {
                    actionBuilder.setAllowGeneratedReplies(action.getBoolean("allowGeneratedReplies"));
                }
                if (action.hasKey("showsUserInterface")) {
                    actionBuilder.setShowsUserInterface(action.getBoolean("showsUserInterface"));
                }
                builder.addAction(actionBuilder.build());
            }
        }

        notificationManager.notify(notificationID, builder.build());
        promise.resolve(notificationID);
    }

    @SuppressWarnings("unused")
    @ReactMethod
    public void startMainActivity() {
        if (verbose) Log.i("ReactNativeMoPushNotifi", "startMainActivity");
        Intent intent = Objects.requireNonNull(getReactApplicationContext().getPackageManager().getLaunchIntentForPackage(getReactApplicationContext().getPackageName()));
        intent.addFlags(Intent.FLAG_ACTIVITY_REORDER_TO_FRONT);
        if (verbose) Log.i("ReactNativeMoPushNotifi", "startMainActivity start");
        // @TODO: does not work in android Q
        getReactApplicationContext().startActivity(intent);
    }

    @SuppressWarnings("unused")
    @ReactMethod
    public void acquireWakeLock(String tag, int timeout, Promise promise) {
        PowerManager powerManager = Objects.requireNonNull((PowerManager)getReactApplicationContext().getSystemService(Context.POWER_SERVICE));
        PowerManager.WakeLock wakeLock = powerManager.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK,
                tag);
        String key = "" + wakeLock.hashCode() + "-" + wakeLock.toString();
        this.wakeLocks.put(key, wakeLock);
        wakeLock.acquire(timeout);
        promise.resolve(key);
    }

    @SuppressWarnings("unused")
    @ReactMethod
    public void releaseWakeLock(String key) {
        PowerManager.WakeLock wakeLock = this.wakeLocks.remove(key);
        if (wakeLock == null) return;
        wakeLock.release();
    }

    @Override
    public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {
    }

    @Override
    public void onNewIntent(Intent intent) {
        if (intent.hasExtra("google.message_id")) {
            // no way to get existing notification / title etc.
            Bundle extras = Objects.requireNonNull(intent.getExtras());
            if (verbose) {
                Log.i("RNMoPushNotification", "onNewIntent " + intent.getAction() + " " + extras);
                for (String k : extras.keySet()) {
                    Log.i("RNMoPushNotification", "[" + k + "] = " + extras.get(k));
                }
            }
            WritableMap args = Arguments.createMap();
            args.putString("type", "onNotificationIntent");
            args.putString("from", extras.getString("from"));
            args.putString("collapseKey", extras.getString("collapse_key"));
            args.putString("messageId", extras.getString("google.message_id"));
            // google.sent_time
            // google.ttl
            // google.original_priority
            WritableMap data = Arguments.createMap();
            for (String k : extras.keySet()) {
                if (k.startsWith("google.") || k.startsWith("android.") || k.equals("from") || k.equals("collapse_key")) continue;
                data.putString(k, extras.getString(k));
            }
            args.putMap("data", data);
            getReactApplicationContext().getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("ReactNativeMoPushNotification", args);
        }

        if (intent.hasExtra("ReactNativeMoPushNotification")) {
            Bundle bundle = intent.getBundleExtra("ReactNativeMoPushNotification");
            Bundle data = bundle.getBundle("data");
            Notification notification = bundle.getParcelable("notification");
            if (verbose) {
                Log.i("RNMoPushNotification", "onNewIntent ReactNativeMoPushNotification");
                for (String k : bundle.keySet()) {
                    Log.i("RNMoPushNotification", "[" + k + "] = " + bundle.get(k));
                }
                if (data != null) {
                    for (String k : data.keySet()) {
                        Log.i("RNMoPushNotification", "[data." + k + "] = " + data.get(k));
                    }
                }
                if (notification != null) {
                    if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.KITKAT) {
                        for (String k : notification.extras.keySet()) {
                            Log.i("RNMoPushNotification", "[notification.extras." + k + "] = " + notification.extras.get(k));
                        }
                    }
                }
            }
            WritableMap args = Arguments.createMap();
            args.putString("type", "onNotificationClicked");
            args.putInt("id", bundle.getInt("id", 0));
            if (bundle.containsKey("action")) args.putString("action", bundle.getString("action"));
            if (notification != null) {
                notificationToMap(notification, args);
            }
            getReactApplicationContext().getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("ReactNativeMoPushNotification", args);
        }


    }

    @Override
    public void onHostResume() {
        Activity activity = getReactApplicationContext().getCurrentActivity();
        if (activity != null) {
            Intent intent = activity.getIntent();
            this.onNewIntent(intent);
        }
    }

    @Override
    public void onHostPause() {
    }

    @Override
    public void onHostDestroy() {
    }
}
