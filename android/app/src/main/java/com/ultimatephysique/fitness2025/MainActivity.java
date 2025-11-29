package com.ultimatephysique.fitness2025;

import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;
import android.view.View;
import android.view.ViewTreeObserver;
import android.graphics.Rect;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "MainActivity";
    
    // ✅ 新增：追蹤狀態，避免重複注入和頻繁更新
    private boolean isWebViewReady = false;
    private boolean lastKeyboardState = false;
    private int lastKeyboardHeight = 0;
    private Handler mainHandler = new Handler(Looper.getMainLooper());
    private Runnable keyboardDetectionRunnable = null;
    private static final long KEYBOARD_DETECTION_DELAY = 100; // 防抖延遲
    
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // 啟用邊緣到邊緣顯示（Edge-to-Edge）
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        
        // 設定狀態列和導覽列樣式
        WindowInsetsControllerCompat windowInsetsController = 
            WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
        
        if (windowInsetsController != null) {
            windowInsetsController.setAppearanceLightStatusBars(true);
            windowInsetsController.setAppearanceLightNavigationBars(true);
        }
        
        getWindow().setStatusBarColor(android.graphics.Color.WHITE);
        getWindow().setNavigationBarColor(android.graphics.Color.WHITE);
        
        // ✅ 關鍵改進：等待 WebView 完全準備好後再注入
        setupWebViewReadyListener();
    }
    
    /**
     * ✅ 關鍵改進：設置 WebView 準備就緒監聽器
     * 不覆蓋 Capacitor 的 WebViewClient，使用 JavaScript 檢查頁面準備狀態
     */
    private void setupWebViewReadyListener() {
        // 延遲獲取 WebView，確保 Capacitor Bridge 已初始化
        mainHandler.postDelayed(new Runnable() {
            @Override
            public void run() {
                try {
                    WebView webView = getBridge().getWebView();
                    if (webView == null) {
                        // WebView 還沒準備好，繼續等待
                        mainHandler.postDelayed(this, 200);
                        return;
                    }
                    
                    // ✅ 關鍵改進：不覆蓋 Capacitor 的 WebViewClient
                    // 使用 JavaScript 注入來檢查頁面是否準備好
                    checkWebViewReady();
                    
                } catch (Exception e) {
                    Log.e(TAG, "Error setting up WebView listener", e);
                    // 如果出錯，稍後重試
                    mainHandler.postDelayed(this, 500);
                }
            }
        }, 500); // ✅ 增加初始延遲，確保 Capacitor 完全初始化
    }
    
    /**
     * ✅ 改進：使用 JavaScript 檢查頁面是否準備好，不覆蓋 WebViewClient
     */
    private void checkWebViewReady() {
        WebView webView = getBridge().getWebView();
        if (webView == null) {
            return;
        }
        
        // 使用 JavaScript 檢查 document.readyState
        String checkScript = "(function() { " +
            "  if (document.readyState === 'complete' || document.readyState === 'interactive') { " +
            "    return 'ready'; " +
            "  } " +
            "  return 'loading'; " +
            "})();";
        
        webView.evaluateJavascript(checkScript, new android.webkit.ValueCallback<String>() {
            @Override
            public void onReceiveValue(String value) {
                if (value != null && value.contains("ready")) {
                    if (!isWebViewReady) {
                        isWebViewReady = true;
                        Log.d(TAG, "WebView is ready");
                        
                        // 延遲注入，確保 JavaScript 環境完全準備好
                        mainHandler.postDelayed(new Runnable() {
                            @Override
                            public void run() {
                                injectStatusBarHeight();
                                setupKeyboardListener();
                            }
                        }, 300);
                    }
                } else {
                    // 頁面還沒準備好，繼續檢查
                    mainHandler.postDelayed(new Runnable() {
                        @Override
                        public void run() {
                            checkWebViewReady();
                        }
                    }, 200);
                }
            }
        });
    }
    
    /**
     * ✅ 關鍵改進：只有在 WebView 準備好後才設置鍵盤監聽
     */
    private void setupKeyboardListener() {
        View decorView = getWindow().getDecorView();
        decorView.getViewTreeObserver().addOnGlobalLayoutListener(new ViewTreeObserver.OnGlobalLayoutListener() {
            @Override
            public void onGlobalLayout() {
                // 只有在 WebView 準備好後才執行
                if (!isWebViewReady) {
                    return;
                }
                
                // ✅ 使用防抖機制，避免頻繁觸發
                if (keyboardDetectionRunnable != null) {
                    mainHandler.removeCallbacks(keyboardDetectionRunnable);
                }
                
                keyboardDetectionRunnable = new Runnable() {
                    @Override
                    public void run() {
                        detectKeyboardState();
                    }
                };
                
                mainHandler.postDelayed(keyboardDetectionRunnable, KEYBOARD_DETECTION_DELAY);
            }
        });
    }
    
    /**
     * 檢測鍵盤狀態並注入到 WebView
     * ✅ 改進：只有狀態真正改變時才注入
     */
    private void detectKeyboardState() {
        try {
            if (!isWebViewReady) {
                return;
            }
            
            View decorView = getWindow().getDecorView();
            if (decorView == null) {
                return;
            }
            
            // 獲取可見區域的矩形
            Rect r = new Rect();
            decorView.getWindowVisibleDisplayFrame(r);
            
            // 獲取屏幕總高度
            int screenHeight = decorView.getRootView().getHeight();
            
            // 計算鍵盤高度（屏幕高度 - 可見區域底部）
            int keypadHeight = screenHeight - r.bottom;
            
            // 使用更精確的閾值
            int threshold = Math.max(100, (int)(screenHeight * 0.10));
            boolean isKeyboardVisible = keypadHeight > threshold;
            
            // ✅ 關鍵改進：只有狀態真正改變時才注入（避免頻繁更新）
            if (isKeyboardVisible == lastKeyboardState && 
                Math.abs(keypadHeight - lastKeyboardHeight) < 20) {
                return; // 狀態沒有變化，跳過
            }
            
            // 更新狀態
            lastKeyboardState = isKeyboardVisible;
            lastKeyboardHeight = keypadHeight;
            
            // 獲取 WebView 實例
            WebView webView = getBridge().getWebView();
            if (webView == null) {
                return;
            }
            
            // 構建 JavaScript 代碼來注入鍵盤狀態
            final String js = buildKeyboardStateScript(isKeyboardVisible, keypadHeight);
            final boolean finalIsKeyboardVisible = isKeyboardVisible;
            final int finalKeypadHeight = keypadHeight;
            
            // ✅ 確保在主線程執行
            mainHandler.post(new Runnable() {
                @Override
                public void run() {
                    try {
                        WebView wv = getBridge().getWebView();
                        if (wv != null && isWebViewReady) {
                            wv.evaluateJavascript(js, null);
                            Log.d(TAG, String.format(
                                "Keyboard state injected: visible=%s, height=%dpx",
                                finalIsKeyboardVisible, finalKeypadHeight
                            ));
                        }
                    } catch (Exception e) {
                        Log.e(TAG, "Error evaluating keyboard script", e);
                    }
                }
            });
            
        } catch (Exception e) {
            Log.e(TAG, "Error in detectKeyboardState", e);
        }
    }
    
    /**
     * 構建鍵盤狀態 JavaScript 注入腳本
     */
    private String buildKeyboardStateScript(boolean isVisible, int height) {
        StringBuilder js = new StringBuilder();
        js.append("(function() { ");
        js.append("  try { ");
        js.append("    var isVisible = ").append(isVisible ? "true" : "false").append("; ");
        js.append("    var height = ").append(height).append("; ");
        js.append("    document.documentElement.style.setProperty('--keyboard-height', height + 'px'); ");
        js.append("    document.documentElement.style.setProperty('--is-keyboard-visible', isVisible ? '1' : '0'); ");
        js.append("    if (isVisible) { ");
        js.append("      document.documentElement.setAttribute('data-keyboard-visible', 'true'); ");
        js.append("    } else { ");
        js.append("      document.documentElement.removeAttribute('data-keyboard-visible'); ");
        js.append("    } ");
        js.append("    window.dispatchEvent(new CustomEvent('keyboardToggle', { ");
        js.append("      detail: { isVisible: isVisible, height: height } ");
        js.append("    })); ");
        js.append("  } catch (e) { ");
        js.append("    console.error('[Native] Error updating keyboard state:', e); ");
        js.append("  } ");
        js.append("})();");
        
        return js.toString();
    }
    
    /**
     * 使用 WindowInsets API 獲取準確的 status bar 和 navigation bar 高度
     */
    private void injectStatusBarHeight() {
        try {
            if (!isWebViewReady) {
                Log.d(TAG, "WebView not ready, skipping status bar injection");
                return;
            }
            
            View decorView = getWindow().getDecorView();
            if (decorView == null) {
                Log.w(TAG, "DecorView is null");
                return;
            }
            
            WindowInsetsCompat windowInsets = ViewCompat.getRootWindowInsets(decorView);
            if (windowInsets == null) {
                Log.w(TAG, "WindowInsets is null, using fallback");
                injectStatusBarHeightFromResources();
                return;
            }
            
            final int statusBarHeight = windowInsets.getInsets(WindowInsetsCompat.Type.statusBars()).top;
            final int navBarHeight = windowInsets.getInsets(WindowInsetsCompat.Type.navigationBars()).bottom;
            final int leftInset = windowInsets.getInsets(WindowInsetsCompat.Type.systemBars()).left;
            final int rightInset = windowInsets.getInsets(WindowInsetsCompat.Type.systemBars()).right;
            
            if (statusBarHeight <= 0) {
                Log.w(TAG, "Invalid status bar height, using fallback");
                injectStatusBarHeightFromResources();
                return;
            }
            
            WebView webView = getBridge().getWebView();
            if (webView == null) {
                Log.w(TAG, "WebView is null");
                return;
            }
            
            final String js = buildInjectionScript(statusBarHeight, navBarHeight, leftInset, rightInset);
            
            // ✅ 確保在主線程執行
            mainHandler.post(new Runnable() {
                @Override
                public void run() {
                    try {
                        WebView wv = getBridge().getWebView();
                        if (wv != null && isWebViewReady) {
                            wv.evaluateJavascript(js, null);
                            Log.d(TAG, String.format(
                                "Status bar injected: top=%dpx, bottom=%dpx",
                                statusBarHeight, navBarHeight
                            ));
                        }
                    } catch (Exception e) {
                        Log.e(TAG, "Error evaluating status bar script", e);
                    }
                }
            });
            
        } catch (Exception e) {
            Log.e(TAG, "Error injecting status bar height", e);
            injectStatusBarHeightFromResources();
        }
    }
    
    /**
     * 備用方案：從 Android 資源中獲取 status bar 高度
     */
    private void injectStatusBarHeightFromResources() {
        try {
            if (!isWebViewReady) {
                return;
            }
            
            int resourceId = getResources().getIdentifier("status_bar_height", "dimen", "android");
            int statusBarHeight = resourceId > 0 
                ? getResources().getDimensionPixelSize(resourceId) 
                : 24;
            
            if (statusBarHeight <= 0) {
                statusBarHeight = 24;
            }
            
            final int finalHeight = statusBarHeight;
            final String js = buildInjectionScript(finalHeight, 0, 0, 0);
            
            mainHandler.post(new Runnable() {
                @Override
                public void run() {
                    try {
                        WebView webView = getBridge().getWebView();
                        if (webView != null && isWebViewReady) {
                            webView.evaluateJavascript(js, null);
                            Log.d(TAG, "Status bar injected from resources: " + finalHeight + "px");
                        }
                    } catch (Exception e) {
                        Log.e(TAG, "Error evaluating fallback script", e);
                    }
                }
            });
        } catch (Exception e) {
            Log.e(TAG, "Error injecting from resources", e);
        }
    }
    
    /**
     * 構建 JavaScript 注入腳本
     */
    private String buildInjectionScript(int top, int bottom, int left, int right) {
        StringBuilder js = new StringBuilder();
        js.append("(function() { ");
        js.append("  try { ");
        js.append("    var style = document.getElementById('android-status-bar-height-fix'); ");
        js.append("    if (!style) { ");
        js.append("      style = document.createElement('style'); ");
        js.append("      style.id = 'android-status-bar-height-fix'; ");
        js.append("      document.head.appendChild(style); ");
        js.append("    } ");
        js.append("    document.documentElement.style.setProperty('--safe-area-inset-top', '").append(top).append("px'); ");
        js.append("    document.documentElement.style.setProperty('--safe-area-inset-bottom', '").append(bottom).append("px'); ");
        js.append("    document.documentElement.style.setProperty('--safe-area-inset-left', '").append(left).append("px'); ");
        js.append("    document.documentElement.style.setProperty('--safe-area-inset-right', '").append(right).append("px'); ");
        js.append("    style.textContent = ':root { ");
        js.append("      --safe-area-inset-top: ").append(top).append("px !important; ");
        js.append("      --safe-area-inset-bottom: ").append(bottom).append("px !important; ");
        js.append("      --safe-area-inset-left: ").append(left).append("px !important; ");
        js.append("      --safe-area-inset-right: ").append(right).append("px !important; ");
        js.append("    }'; ");
        js.append("    window.__nativeInsetsInjected = true; ");
        js.append("    window.dispatchEvent(new CustomEvent('nativeInsetsUpdated', { ");
        js.append("      detail: { top: ").append(top).append(", bottom: ").append(bottom).append(", left: ").append(left).append(", right: ").append(right).append(" } ");
        js.append("    })); ");
        js.append("  } catch (e) { ");
        js.append("    console.error('[Native] Error injecting status bar:', e); ");
        js.append("  } ");
        js.append("})();");
        
        return js.toString();
    }
}
