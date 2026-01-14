# ⚡ V6.22: Google Auth 包迁移修复

## 问题原因

**我们并没有主动修改这些文件。** 问题是：

1. **`@belongnet/capacitor-google-auth` 包已被从 npm registry 移除**
   - 该包在 2024-2025 年间被删除
   - Netlify 构建时无法找到该包，导致 404 错误

2. **这是外部依赖变化，不是我们的代码问题**
   - 包维护者移除了该包
   - 需要迁移到替代方案

## 修复内容

### 已更新的文件

1. **`package.json`**
   - 从：`@belongnet/capacitor-google-auth: ^6.0.0-rc.0`
   - 到：`@daniele-rolli/capacitor-google-auth: ^6.0.0`

2. **`src/utils/nativeGoogleAuth.js`**
   - 更新 import 语句

3. **`vite.config.js`**
   - 更新路径匹配规则

### 需要执行的后续步骤

1. **安装新依赖**
   ```bash
   npm install
   ```

2. **同步 Capacitor（自动更新 Android 配置）**
   ```bash
   npx cap sync
   ```
   - 这会自动更新 `android/capacitor.settings.gradle`
   - 这会自动更新 `android/app/capacitor.build.gradle`

3. **提交更改**
   ```bash
   git add .
   git commit -m "fix: 迁移到 @daniele-rolli/capacitor-google-auth"
   git push
   ```

## 新包说明

- **`@daniele-rolli/capacitor-google-auth`**
  - 是 `@codetrix-studio/capacitor-google-auth` 的 fork
  - 兼容 Capacitor 6
  - API 完全兼容，无需修改业务代码
  - 正在积极维护

## 验证

部署成功后，检查：
- ✅ Netlify 构建不再出现 404 错误
- ✅ `npm install` 成功完成
- ✅ Google 登录功能正常工作

## 注意事项

- Android 配置文件（`capacitor.settings.gradle` 和 `capacitor.build.gradle`）是自动生成的
- 运行 `npx cap sync` 后会自动更新
- 不要手动编辑这些文件
