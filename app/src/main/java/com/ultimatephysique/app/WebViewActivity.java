package com.ultimatephysique.app;

import com.ultimatephysique.fitness2025.R;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Intent;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;
import android.view.KeyEvent;
import android.view.View;
import android.view.Window;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.ProgressBar;

public class WebViewActivity extends Activity {
    private static final String TAG = "WebViewActivity";
    private WebView webView;
    private ProgressBar progressBar;
    private static final String WEBSITE_URL = "https://fitness-app2025.netlify.app/";

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // 隱藏標題欄
        requestWindowFeature(Window.FEATURE_NO_TITLE);

        setContentView(R.layout.activity_webview);

        webView = findViewById(R.id.webview);
        progressBar = findViewById(R.id.progressBar);

        // 配置 WebView 設定
        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        webSettings.setLoadWithOverviewMode(true);
        webSettings.setUseWideViewPort(true);
        webSettings.setBuiltInZoomControls(false);
        webSettings.setDisplayZoomControls(false);
        webSettings.setSupportZoom(false);
        webSettings.setDefaultTextEncodingName("utf-8");

        // 支援混合內容
        webSettings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);

        // 加強安全配置
        webSettings.setAllowFileAccess(false);
        webSettings.setAllowContentAccess(false);
        webSettings.setAllowFileAccessFromFileURLs(false);
        webSettings.setAllowUniversalAccessFromFileURLs(false);

        // 設定 WebViewClient
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageStarted(WebView view, String url, Bitmap favicon) {
                super.onPageStarted(view, url, favicon);
                progressBar.setVisibility(View.VISIBLE);
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                progressBar.setVisibility(View.GONE);
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                String url = request.getUrl().toString();
                // 如果是我們的網站，在 WebView 中載入
                if (url.startsWith(WEBSITE_URL)) {
                    return false;
                }
                // 其他連結用外部瀏覽器開啟
                Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                startActivity(intent);
                return true;
            }
        });

        // 設定 WebChromeClient
        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onProgressChanged(WebView view, int newProgress) {
                progressBar.setProgress(newProgress);
            }
        });

        // 載入網站 - 添加錯誤處理
        try {
            Log.d(TAG, "Loading website: " + WEBSITE_URL);
            webView.loadUrl(WEBSITE_URL);
        } catch (Exception e) {
            Log.e(TAG, "Failed to load URL: " + WEBSITE_URL, e);
            // 可以顯示錯誤頁面或重試機制
            // 這裡先記錄錯誤，讓 WebView 自己處理
        }
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        // 處理返回鍵
        if (keyCode == KeyEvent.KEYCODE_BACK && webView.canGoBack()) {
            webView.goBack();
            return true;
        }
        return super.onKeyDown(keyCode, event);
    }

    @Override
    protected void onDestroy() {
        try {
            if (webView != null) {
                Log.d(TAG, "Destroying WebView");
                webView.destroy();
            }
        } catch (Exception e) {
            Log.e(TAG, "Error destroying WebView", e);
        }
        super.onDestroy();
    }
}
