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
    }
}
