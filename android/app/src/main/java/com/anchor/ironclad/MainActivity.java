package com.anchor.ironclad;

import android.os.Build;
import android.os.Bundle;
import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint;
import com.facebook.react.defaults.DefaultReactActivityDelegate;

public class MainActivity extends ReactActivity {

    /**
     * Returns the name of the main component registered from JavaScript. This is used to schedule
     * rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "main";
    }

    /**
     * Returns the instance of the {@link ReactActivityDelegate}. Here we use a util class {@link
     * DefaultReactActivityDelegate} which allows you to easily enable Fabric and Concurrent React
     * (aka React 18) with two boolean flags.
     */
    @Override
    protected ReactActivityDelegate createReactActivityDelegate() {
        return new DefaultReactActivityDelegate(
                this,
                getMainComponentName(),
                // If you opted-in for the New Architecture, we enable the Fabric Renderer.
                DefaultNewArchitectureEntryPoint.getFabricEnabled());
    }

    /**
     * Configure Material You (One UI 8) dynamic theming
     */
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // Enable Material You dynamic colors (Android 12+ / One UI 4+)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            // This enables dynamic color system that follows user's wallpaper
            setTheme(android.R.style.Theme_DeviceDefault_DayNight);
        }
        
        super.onCreate(savedInstanceState);
        
        // Enable edge-to-edge display (One UI 8 feature)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            getWindow().setDecorFitsSystemWindows(false);
        }
    }
    
    /**
     * Handle predictive back gesture (Android 13+ / One UI 5+)
     */
    @Override
    public void onBackPressed() {
        // Let React Native handle back navigation with predictive animation
        super.onBackPressed();
    }
}
