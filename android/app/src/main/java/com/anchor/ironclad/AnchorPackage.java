package com.anchor.ironclad;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Package to register custom native modules
 */
public class AnchorPackage implements ReactPackage {

    @Override
    public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
        return Collections.emptyList();
    }

    @Override
    public List<NativeModule> createNativeModules(ReactApplicationContext reactContext) {
        List<NativeModule> modules = new ArrayList<>();
        modules.add(new TimerModule(reactContext));
        modules.add(new WidgetModule(reactContext));
        modules.add(new DNDModule(reactContext));
        modules.add(new NowBarModule(reactContext));
        return modules;
    }
}
