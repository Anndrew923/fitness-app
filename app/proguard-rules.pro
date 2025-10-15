# ProGuard rules for Android WebView App

# 保留應用程式基本結構
-keep class com.ultimatephysique.app.** { *; }
-keep class * extends android.app.Application
-keep class * extends android.app.Activity
-keep class * extends android.app.Service

# 保留 WebView 相關類別
-keep class android.webkit.** { *; }
-keepclassmembers class * extends android.webkit.WebViewClient {
    public void *(android.webkit.WebView, java.lang.String);
}

# 保留權限聲明 - 這是最重要的！
-keep class android.Manifest { *; }
-keep class android.Manifest$permission { *; }
-keep class com.google.android.gms.permission.** { *; }
-keepclassmembers class android.Manifest$permission {
    public static final java.lang.String AD_ID;
}

# 更強力的權限保護
-keep class android.Manifest$permission {
    public static final java.lang.String AD_ID;
}
-keep class com.google.android.gms.permission.** { *; }
-keep class com.google.android.gms.ads.identifier.** { *; }
-keep class com.google.android.gms.ads.** { *; }

# 保留 Google Play Services 相關類別
-keep class com.google.android.gms.** { *; }
-keep class com.google.android.gms.common.** { *; }
-keep class com.google.android.gms.ads.** { *; }
-keep class com.google.android.gms.ads.identifier.** { *; }

# 保留廣告 ID 相關功能
-keep class com.google.android.gms.ads.identifier.AdvertisingIdClient { *; }
-keep class com.google.android.gms.ads.identifier.AdvertisingIdClient$* { *; }

# 不混淆 R 類別
-keepclassmembers class **.R$* {
    public static <fields>;
}

# 保留屬性
-keepattributes *Annotation*
-keepattributes Signature
-keepattributes InnerClasses
-keepattributes EnclosingMethod

# 警告處理
-dontwarn com.google.android.gms.**
-dontwarn android.webkit.**

# 優化設定
-optimizationpasses 5
-dontusemixedcaseclassnames
-dontskipnonpubliclibraryclasses
-verbose
