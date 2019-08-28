package de.mxs.reactnativemovibrate;

import android.app.Activity;
import android.content.Context;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.view.HapticFeedbackConstants;
import android.view.View;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;

import javax.annotation.Nonnull;

public class ReactNativeMoVibrate extends ReactContextBaseJavaModule {

    ReactNativeMoVibrate(@Nonnull ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public @Nonnull
    String getName() {
        return "ReactNativeMoVibrate";
    }

    @SuppressWarnings("unused")
    @ReactMethod
    public void vibrate(int type) {
        // https://developer.android.com/reference/android/view/HapticFeedbackConstants
        getReactApplicationContext().runOnUiQueueThread(() -> {
            Activity activity = getReactApplicationContext().getCurrentActivity();
            if (activity == null) return;
            View view = activity.getWindow().getDecorView();
            view.performHapticFeedback(type, HapticFeedbackConstants.FLAG_IGNORE_VIEW_SETTING);
        });
    }

    @SuppressWarnings("unused")
    @ReactMethod
    public void vibratePattern(ReadableMap args) {
        long[] pattern;
        {
            ReadableArray tmp = args.getArray("pattern");
            if (tmp == null) {
                throw new RuntimeException("pattern is required");
            }
            pattern = new long[tmp.size()];
            for (int i=0; i<pattern.length; i++) {
                pattern[i] = tmp.getInt(i);
            }
        }
        int[] amplitude = new int[pattern.length];
        {
            ReadableArray tmp = args.getArray("amplitude");
            if (tmp == null || tmp.size() != amplitude.length) {
                throw new RuntimeException("amplitude is required and must have same length as pattern");
            }
            for (int i=0; i<amplitude.length; i++) {
                amplitude[i] = tmp.getInt(i);
            }
        }
        int repeat = args.getInt("repeat");
        getReactApplicationContext().runOnUiQueueThread(() -> {
            Vibrator vibrator = (Vibrator)getReactApplicationContext().getSystemService(Context.VIBRATOR_SERVICE);
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
                VibrationEffect vibe = VibrationEffect.createWaveform(pattern, amplitude, repeat);
                vibrator.vibrate(vibe);
            } else {
                vibrator.vibrate(pattern, repeat);
            }
        });
    }

}