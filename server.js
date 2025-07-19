// server.js - 僅用於生產部署
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const app = express();

// 檢查是否為生產環境
const isProduction = process.env.NODE_ENV === 'production';

if (isProduction) {
  app.use(
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'"],
        // 生產環境嚴格CSP（根據需要調整）
        scriptSrc: ["'self'", 'https://apis.google.com'],
        scriptSrcElem: ["'self'", 'https://apis.google.com'],
        styleSrc: ["'self'", "'unsafe-inline'"],
        connectSrc: [
          "'self'",
          'https://*.googleapis.com',
          'https://*.firebaseio.com',
          'wss://*.firebaseio.com',
        ],
        frameSrc: ["'self'", 'https://*.firebaseapp.com'],
        imgSrc: ["'self'", 'data:', 'https:'],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        frameAncestors: ["'none'"],
      },
    })
  );
} else {
  console.log('Development mode - CSP handled by Vite');
}

app.use(express.static(path.join(__dirname, 'dist'))); // 注意：Vite建置到dist目錄

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const port = process.env.PORT || 3001; // 避免與Vite衝突
const server = app.listen(port, () =>
  console.log(`Server running on port ${port}`)
);
server.on('error', err => {
  console.error('Server failed to start:', err);
});
