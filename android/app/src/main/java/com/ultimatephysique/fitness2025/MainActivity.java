package com.ultimatephysique.fitness2025;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Plugin;

import java.util.ArrayList;

// Import the Google Sign-in plugin
import com.capacitor.google.auth.GoogleAuth;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Initializes the Bridge
        this.init(savedInstanceState, new ArrayList<Class<? extends Plugin>>() {{
            // Additional plugins you've installed go here
            // ex. add(TotallyAwesomePlugin.class);

            // Register the Google Auth plugin
            add(GoogleAuth.class);
        }});
    }
}
