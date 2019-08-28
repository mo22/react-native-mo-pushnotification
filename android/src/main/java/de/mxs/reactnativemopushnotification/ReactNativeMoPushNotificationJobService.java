package de.mxs.reactnativemopushnotification;

import android.app.job.JobParameters;
import android.app.job.JobService;
import android.os.Build;
import androidx.annotation.RequiresApi;
import android.util.Log;

@RequiresApi(api = Build.VERSION_CODES.LOLLIPOP)
public final class ReactNativeMoPushNotificationJobService extends JobService {
    @Override
    public boolean onStartJob(JobParameters jobParameters) {
        Log.i("XXX", "onStartJob");
        return false;
    }

    @Override
    public boolean onStopJob(JobParameters jobParameters) {
        Log.i("XXX", "onStopJob");
        return false;
    }
}
