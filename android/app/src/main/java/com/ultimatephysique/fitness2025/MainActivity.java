package com.ultimatephysique.fitness2025;

import android.os.Bundle;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
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
            // 設定狀態列圖示為深色（適合淺色背景）
            windowInsetsController.setAppearanceLightStatusBars(true);
            // 設定導覽列圖示為深色
            windowInsetsController.setAppearanceLightNavigationBars(true);
        }
        
        // 設定狀態列和導覽列為透明
        getWindow().setStatusBarColor(android.graphics.Color.TRANSPARENT);
        getWindow().setNavigationBarColor(android.graphics.Color.TRANSPARENT);
    }
}
