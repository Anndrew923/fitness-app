# Netlify 部署修复指南

## 问题诊断

Netlify 构建失败，错误信息：
- `npm notice Access token expired or revoked`
- `npm error 404 Not Found - GET https://registry.npmjs.org/@belongnet/capacitor-google-auth/-/capacitor-google-auth-6.0.0-rc.0.tgz`

## 解决方案

### 方案 1：配置 npm Token（推荐）

如果 `@belongnet/capacitor-google-auth` 需要认证访问：

1. **创建新的 npm Access Token**
   - 访问：https://www.npmjs.com/settings/[your-username]/tokens
   - 创建新的 **Automation** 或 **Read-only** token
   - 复制 token 值

2. **在 Netlify 中配置环境变量**
   - 进入 Netlify Dashboard
   - Site settings → Build & deploy → Environment
   - 点击 "Add variable"
   - Name: `NPM_TOKEN`
   - Value: `<your-new-npm-token>`
   - 点击 "Save"

3. **项目已包含 .npmrc 文件**
   - `.npmrc` 文件已创建，使用 `${NPM_TOKEN}` 占位符
   - 实际 token 只在 Netlify 环境变量中设置，不会提交到代码库

4. **清除缓存并重新部署**
   - Netlify Dashboard → Deploys
   - 点击 "Trigger deploy" → "Clear cache and deploy site"

### 方案 2：检查包是否真的需要认证

如果包是公开的，可能不需要 token。尝试：

1. **移除 .npmrc（如果不需要认证）**
   ```bash
   # 如果确认包是公开的，可以删除 .npmrc
   rm .npmrc
   ```

2. **或者保持 .npmrc，但不在 Netlify 设置 NPM_TOKEN**
   - 如果包是公开的，`.npmrc` 中的 `${NPM_TOKEN}` 为空时，npm 会使用公开访问

### 方案 3：使用 GitHub 作为包源（备选）

如果 npm registry 持续有问题，可以改用 GitHub：

```json
{
  "dependencies": {
    "@belongnet/capacitor-google-auth": "github:belongnet/capacitor-google-auth#v6.0.0-rc.0"
  }
}
```

**注意：** 需要确认包的 GitHub 仓库地址和 tag 名称。

## 验证步骤

1. 配置完成后，触发新的部署
2. 检查构建日志，确认 `npm install` 成功
3. 如果仍有问题，检查：
   - Netlify 环境变量是否正确设置
   - npm token 是否有访问该 scoped package 的权限
   - 包的版本是否仍然可用

## 当前配置

- ✅ `.npmrc` 文件已创建
- ⚠️ 需要在 Netlify 中设置 `NPM_TOKEN` 环境变量
- ⚠️ 需要清除 Netlify 构建缓存
