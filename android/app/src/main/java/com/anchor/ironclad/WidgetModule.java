package com.anchor.ironclad;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import android.content.Intent;
import android.content.SharedPreferences;
import android.appwidget.AppWidgetManager;
import android.content.ComponentName;

/**
 * React Native module bridge for widget updates
 */
public class WidgetModule extends ReactContextBaseJavaModule {
    private static final String MODULE_NAME = "WidgetModule";
    private static final String PREFS_NAME = "AnchorWidgetPrefs";

    WidgetModule(ReactApplicationContext context) {
        super(context);
    }

    @Override
    public String getName() {
        return MODULE_NAME;
    }

    @ReactMethod
    public void updateWidget(String taskText, double timeRemaining) {
        ReactApplicationContext context = getReactApplicationContext();
        
        // Save task data to SharedPreferences
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, context.MODE_PRIVATE);
        SharedPreferences.Editor editor = prefs.edit();
        editor.putString("currentTask", taskText);
        editor.putLong("timeRemaining", (long) timeRemaining);
        editor.putLong("lastUpdate", System.currentTimeMillis());
        editor.apply();
        
        // Trigger widget update
        Intent intent = new Intent(context, AnchorWidgetProvider.class);
        intent.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
        
        AppWidgetManager widgetManager = AppWidgetManager.getInstance(context);
        int[] ids = widgetManager.getAppWidgetIds(new ComponentName(context, AnchorWidgetProvider.class));
        intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids);
        
        context.sendBroadcast(intent);
    }

    @ReactMethod
    public void clearWidget() {
        ReactApplicationContext context = getReactApplicationContext();
        
        // Clear task data
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, context.MODE_PRIVATE);
        prefs.edit().clear().apply();
        
        // Trigger widget update
        Intent intent = new Intent(context, AnchorWidgetProvider.class);
        intent.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
        
        AppWidgetManager widgetManager = AppWidgetManager.getInstance(context);
        int[] ids = widgetManager.getAppWidgetIds(new ComponentName(context, AnchorWidgetProvider.class));
        intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids);
        
        context.sendBroadcast(intent);
    }
}
