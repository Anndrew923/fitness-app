# 從 Android Studio 獲取 SHA256 指紋

## 步驟：

1. **開啟 Android Studio**
2. **開啟您的專案**
3. **右鍵點擊 android.keystore 檔案**
4. **選擇「Open in Explorer」**
5. **在檔案總管中右鍵點擊 android.keystore**
6. **選擇「Properties」→「Details」**
7. **查看「Digital Signatures」標籤**
8. **複製 SHA256 指紋**

## 或者使用 Gradle：

```bash
# 在專案根目錄執行
./gradlew signingReport
```

## 或者使用命令提示字元（不是 PowerShell）：

```cmd
keytool -list -v -keystore android.keystore -alias upload
```

## 優點：

- ✅ 不需要在 PowerShell 中輸入密碼
- ✅ 使用原生 Windows 命令提示字元
- ✅ 更穩定可靠
