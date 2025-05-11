import js from "@eslint/js";
import globals from "globals";
import pluginReact from "eslint-plugin-react";
import reactHooks from 'eslint-plugin-react-hooks'; // 新增
import { defineConfig } from "eslint/config";

export default defineConfig([
  { files: ["**/*.{js,mjs,cjs,jsx}"], plugins: { js }, extends: ["js/recommended"] },
  { files: ["**/*.{js,mjs,cjs,jsx}"], languageOptions: { globals: globals.browser } },
  pluginReact.configs.flat.recommended,
  { // 新增 React Hooks 配置
    files: ["**/*.{js,mjs,cjs,jsx}"],
    plugins: {
      'react-hooks': reactHooks
    },
    rules: {
      ...reactHooks.configs.recommended.rules, // 啟用 React Hooks 推薦規則
      'react-hooks/exhaustive-deps': 'warn' // 明確設置嚴重性
    }
  }
]);