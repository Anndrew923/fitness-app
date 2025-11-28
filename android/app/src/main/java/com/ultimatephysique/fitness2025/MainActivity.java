package com.ultimatephysique.fitness2025;

import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.view.ViewTreeObserver;
import android.graphics.Rect;
import android.webkit.WebView;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "MainActivity";
    
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // 啟用邊緣到邊緣顯示（Edge-to-Edge）
        // 這會讓 WebView 內容延伸到狀態列和導覽列下方
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        
        // 設定狀態列和導覽列樣式
        WindowInsetsControllerCompat windowInsetsController = 
            WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
        
        if (windowInsetsController != null) {
            // ✅ 修正：設定狀態列圖示為深色（適合白色背景）
            windowInsetsController.setAppearanceLightStatusBars(true);
            // ✅ 修正：設定導覽列圖示為深色（適合白色背景）
            windowInsetsController.setAppearanceLightNavigationBars(true);
        }
        
        // ✅ 修正：設定狀態列為白色背景（不透明）
        // 使用白色背景，確保狀態列一直保持白色，不會變成透明
        getWindow().setStatusBarColor(android.graphics.Color.WHITE);
        
        // ✅ 修正：設定導覽列為白色背景（不透明）
        // 使用白色背景，確保導覽列有自己獨立的區塊
        getWindow().setNavigationBarColor(android.graphics.Color.WHITE);
        
        // ✅ 新增：獲取 status bar 高度並注入到 WebView（使用 WindowInsets API）
        // 使用 post() 確保在視圖完全準備好後再執行
        View decorView = getWindow().getDecorView();
        decorView.post(new Runnable() {
            @Override
            public void run() {
                try {
                    injectStatusBarHeight();
                } catch (Exception e) {
                    Log.e(TAG, "Failed to inject status bar height", e);
                }
            }
        });
        
        // ✅ 新增：原生鍵盤監聽（提供最準確的鍵盤檢測）
        // 使用 ViewTreeObserver 監聽佈局變化，檢測鍵盤顯示/隱藏
        decorView.getViewTreeObserver().addOnGlobalLayoutListener(new ViewTreeObserver.OnGlobalLayoutListener() {
            @Override
            public void onGlobalLayout() {
                try {
                    detectKeyboardState();
                } catch (Exception e) {
                    Log.e(TAG, "Error detecting keyboard state", e);
                }
            }
        });
    }
    
    /**
     * 檢測鍵盤狀態並注入到 WebView
     * 使用 ViewTreeObserver 監聽佈局變化，這是 Android 檢測鍵盤最準確的方法
     */
    private void detectKeyboardState() {
        try {
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
            
            // 如果鍵盤高度超過屏幕的 15%，認為鍵盤已開啟
            // 這個閾值可以過濾掉系統 UI（狀態列、導覽列）的變化
            boolean isKeyboardVisible = keypadHeight > screenHeight * 0.15;
            
            // 獲取 WebView 實例
            WebView webView = getBridge().getWebView();
            if (webView == null) {
                return;
            }
            
            // 構建 JavaScript 代碼來注入鍵盤狀態
            String js = buildKeyboardStateScript(isKeyboardVisible, keypadHeight);
            
            // 執行 JavaScript 注入
            webView.evaluateJavascript(js, null);
            
            Log.d(TAG, String.format(
                "Keyboard state detected: visible=%s, height=%dpx",
                isKeyboardVisible, keypadHeight
            ));
            
        } catch (Exception e) {
            Log.e(TAG, "Error in detectKeyboardState", e);
        }
    }
    
    /**
     * 構建鍵盤狀態 JavaScript 注入腳本
     */
    private String buildKeyboardStateScript(boolean isVisible, int height) {
        return String.format(
            "(function() { " +
            "  try { " +
            "    var isVisible = %s; " +
            "    var height = %d; " +
            "    " +
            "    // 設置 CSS 變數 " +
            "    document.documentElement.style.setProperty('--keyboard-height', height + 'px'); " +
            "    document.documentElement.style.setProperty('--is-keyboard-visible', isVisible ? '1' : '0'); " +
            "    " +
            "    // 設置 data 屬性，供 CSS 選擇器使用 " +
            "    if (isVisible) { " +
            "      document.documentElement.setAttribute('data-keyboard-visible', 'true'); " +
            "    } else { " +
            "      document.documentElement.removeAttribute('data-keyboard-visible'); " +
            "    } " +
            "    " +
            "    // 觸發自定義事件，通知其他組件 " +
            "    window.dispatchEvent(new CustomEvent('keyboardToggle', { " +
            "      detail: { isVisible: isVisible, height: height } " +
            "    })); " +
            "    " +
            "    console.log('[Native] Keyboard state updated: visible=' + isVisible + ', height=' + height + 'px'); " +
            "  } catch (e) { " +
            "    console.error('[Native] Error updating keyboard state:', e); " +
            "  } " +
            "})();",
            isVisible ? "true" : "false",
            height
        );
    }
    
    /**
     * 使用 WindowInsets API 獲取準確的 status bar 和 navigation bar 高度
     * 並注入到 WebView 的 JavaScript 環境中
     */
    private void injectStatusBarHeight() {
        try {
            View decorView = getWindow().getDecorView();
            if (decorView == null) {
                Log.w(TAG, "DecorView is null, cannot get WindowInsets");
                return;
            }
            
            WindowInsetsCompat windowInsets = ViewCompat.getRootWindowInsets(decorView);
            if (windowInsets == null) {
                Log.w(TAG, "WindowInsets is null, using fallback method");
                // 備用方案：使用資源獲取 status bar 高度
                injectStatusBarHeightFromResources();
                return;
            }
            
            // 獲取 status bar 高度（最準確的方法）
            int statusBarHeight = windowInsets.getInsets(WindowInsetsCompat.Type.statusBars()).top;
            // 獲取 navigation bar 高度
            int navBarHeight = windowInsets.getInsets(WindowInsetsCompat.Type.navigationBars()).bottom;
            // 獲取左側 insets（用於處理異形屏）
            int leftInset = windowInsets.getInsets(WindowInsetsCompat.Type.systemBars()).left;
            // 獲取右側 insets（用於處理異形屏）
            int rightInset = windowInsets.getInsets(WindowInsetsCompat.Type.systemBars()).right;
            
            // 驗證獲取的值是否合理
            if (statusBarHeight < 0) {
                Log.w(TAG, "Invalid status bar height: " + statusBarHeight + ", using fallback");
                injectStatusBarHeightFromResources();
                return;
            }
            
            // 獲取 WebView 實例
            WebView webView = getBridge().getWebView();
            if (webView == null) {
                Log.w(TAG, "WebView is null, will retry later");
                // 如果 WebView 還沒準備好，稍後再試
                decorView.postDelayed(new Runnable() {
                    @Override
                    public void run() {
                        injectStatusBarHeight();
                    }
                }, 200);
                return;
            }
            
            // 構建 JavaScript 代碼來注入 insets
            String js = buildInjectionScript(statusBarHeight, navBarHeight, leftInset, rightInset);
            
            // 執行 JavaScript 注入
            webView.evaluateJavascript(js, null);
            
            Log.d(TAG, String.format(
                "Status bar height injected: top=%dpx, bottom=%dpx, left=%dpx, right=%dpx",
                statusBarHeight, navBarHeight, leftInset, rightInset
            ));
            
        } catch (Exception e) {
            Log.e(TAG, "Error injecting status bar height", e);
            // 發生錯誤時使用備用方案
            injectStatusBarHeightFromResources();
        }
    }
    
    /**
     * 備用方案：從 Android 資源中獲取 status bar 高度
     */
    private void injectStatusBarHeightFromResources() {
        try {
            int resourceId = getResources().getIdentifier("status_bar_height", "dimen", "android");
            int statusBarHeight = resourceId > 0 
                ? getResources().getDimensionPixelSize(resourceId) 
                : 0;
            
            // 如果資源獲取失敗，使用常見的預設值
            if (statusBarHeight <= 0) {
                statusBarHeight = 24; // Android 標準 status bar 高度
            }
            
            WebView webView = getBridge().getWebView();
            if (webView != null) {
                String js = buildInjectionScript(statusBarHeight, 0, 0, 0);
                webView.evaluateJavascript(js, null);
                Log.d(TAG, "Status bar height injected from resources: " + statusBarHeight + "px");
            }
        } catch (Exception e) {
            Log.e(TAG, "Error injecting status bar height from resources", e);
        }
    }
    
    /**
     * 構建 JavaScript 注入腳本
     */
    private String buildInjectionScript(int top, int bottom, int left, int right) {
        return String.format(
            "(function() { " +
            "  try { " +
            "    // 檢查是否已有注入的樣式，避免重複創建 " +
            "    var style = document.getElementById('android-status-bar-height-fix'); " +
            "    if (!style) { " +
            "      style = document.createElement('style'); " +
            "      style.id = 'android-status-bar-height-fix'; " +
            "      document.head.appendChild(style); " +
            "    } " +
            "    " +
            "    // 設置 CSS 變量 " +
            "    document.documentElement.style.setProperty('--safe-area-inset-top', '%dpx'); " +
            "    document.documentElement.style.setProperty('--safe-area-inset-bottom', '%dpx'); " +
            "    document.documentElement.style.setProperty('--safe-area-inset-left', '%dpx'); " +
            "    document.documentElement.style.setProperty('--safe-area-inset-right', '%dpx'); " +
            "    " +
            "    // 更新樣式表以確保優先級 " +
            "    style.textContent = ':root { " +
            "      --safe-area-inset-top: %dpx !important; " +
            "      --safe-area-inset-bottom: %dpx !important; " +
            "      --safe-area-inset-left: %dpx !important; " +
            "      --safe-area-inset-right: %dpx !important; " +
            "    }'; " +
            "    " +
            "    // 標記已從原生注入，避免 JavaScript 覆蓋 " +
            "    window.__nativeInsetsInjected = true; " +
            "    " +
            "    // 觸發自定義事件，通知其他代碼 insets 已更新 " +
            "    window.dispatchEvent(new CustomEvent('nativeInsetsUpdated', { " +
            "      detail: { top: %d, bottom: %d, left: %d, right: %d } " +
            "    })); " +
            "    " +
            "    console.log('[Native] Status bar insets injected: top=%dpx, bottom=%dpx, left=%dpx, right=%dpx'); " +
            "  } catch (e) { " +
            "    console.error('[Native] Error injecting status bar height:', e); " +
            "  } " +
            "})();",
            top, bottom, left, right,
            top, bottom, left, right,
            top, bottom, left, right,
            top, bottom, left, right
        );
    }
}
