package com.ultimatephysique.app;

import android.util.Log;
import android.webkit.WebView;
import com.google.android.gms.ads.identifier.AdvertisingIdClient;

public class Application extends android.app.Application {

    private static final String TAG = "Application";

    @Override
    public void onCreate() {
        super.onCreate();

        // 啟用 WebView 調試（僅在開發版本）
        // WebView.setWebContentsDebuggingEnabled(true);

        // 暫時禁用 AdMob 功能但保留配置（避免審核問題）
        try {
            // 註解掉 AdMob 初始化，但保留 import 和配置
            // AdvertisingIdClient.getAdvertisingIdInfo(this);
            Log.d(TAG, "AdMob initialization temporarily disabled");
        } catch (Exception e) {
            // 記錄錯誤但不影響 App 啟動
            Log.e(TAG, "AdMob initialization failed", e);
        }

        // 初始化任何需要的全域設定
        Log.d(TAG, "Application initialized successfully");
    }
}
