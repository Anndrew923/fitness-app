// Firebase 寫入監控工具
class FirebaseWriteMonitor {
  constructor() {
    this.writeCounts = {
      setDoc: 0,
      updateDoc: 0,
      addDoc: 0,
      writeBatch: 0,
      arrayUnion: 0,
      arrayRemove: 0,
    };
    this.writeHistory = [];
    this.isMonitoring = false;
  }

  start() {
    if (this.isMonitoring) return;
    this.isMonitoring = true;
    console.log('🔥 Firebase 寫入監控已啟動');
  }

  stop() {
    this.isMonitoring = false;
    console.log('🛑 Firebase 寫入監控已停止');
  }

  logWrite(operation, collection, documentId, data = null) {
    if (!this.isMonitoring) return;

    this.writeCounts[operation]++;

    const writeRecord = {
      timestamp: new Date().toISOString(),
      operation,
      collection,
      documentId,
      data: data ? JSON.stringify(data).substring(0, 100) + '...' : null,
    };

    this.writeHistory.push(writeRecord);

    // 只保留最近100條記錄
    if (this.writeHistory.length > 100) {
      this.writeHistory.shift();
    }

    console.log(
      `📝 Firebase 寫入: ${operation} -> ${collection}/${documentId}`
    );
  }

  getStats() {
    const totalWrites = Object.values(this.writeCounts).reduce(
      (sum, count) => sum + count,
      0
    );

    return {
      totalWrites,
      writeCounts: { ...this.writeCounts },
      recentWrites: this.writeHistory.slice(-10),
      averageWritesPerMinute: this.calculateAverageWritesPerMinute(),
    };
  }

  calculateAverageWritesPerMinute() {
    if (this.writeHistory.length < 2) return 0;

    const firstWrite = new Date(this.writeHistory[0].timestamp);
    const lastWrite = new Date(
      this.writeHistory[this.writeHistory.length - 1].timestamp
    );
    const timeDiffMinutes = (lastWrite - firstWrite) / (1000 * 60);

    return timeDiffMinutes > 0 ? this.writeHistory.length / timeDiffMinutes : 0;
  }

  reset() {
    this.writeCounts = {
      setDoc: 0,
      updateDoc: 0,
      addDoc: 0,
      writeBatch: 0,
      arrayUnion: 0,
      arrayRemove: 0,
    };
    this.writeHistory = [];
    console.log('🔄 Firebase 寫入統計已重置');
  }

  // 檢測異常寫入模式
  detectAnomalies() {
    const stats = this.getStats();
    const anomalies = [];

    // 檢測高頻率寫入
    if (stats.averageWritesPerMinute > 10) {
      anomalies.push({
        type: 'high_frequency',
        message: `檢測到高頻率寫入: ${stats.averageWritesPerMinute.toFixed(
          2
        )} 次/分鐘`,
        severity: 'warning',
      });
    }

    // 檢測特定操作的異常
    if (stats.writeCounts.updateDoc > 50) {
      anomalies.push({
        type: 'frequent_updates',
        message: `檢測到頻繁的 updateDoc 操作: ${stats.writeCounts.updateDoc} 次`,
        severity: 'warning',
      });
    }

    // 檢測短時間內的大量寫入
    const recentWrites = this.writeHistory.slice(-20);
    if (recentWrites.length >= 20) {
      const timeSpan =
        new Date(recentWrites[recentWrites.length - 1].timestamp) -
        new Date(recentWrites[0].timestamp);
      const writesPerSecond = recentWrites.length / (timeSpan / 1000);

      if (writesPerSecond > 2) {
        anomalies.push({
          type: 'burst_writes',
          message: `檢測到寫入爆發: ${writesPerSecond.toFixed(2)} 次/秒`,
          severity: 'error',
        });
      }
    }

    return anomalies;
  }

  // 生成優化建議
  generateOptimizationSuggestions() {
    const stats = this.getStats();
    const anomalies = this.detectAnomalies();
    const suggestions = [];

    if (anomalies.length > 0) {
      suggestions.push('🚨 檢測到異常寫入模式，建議檢查以下方面：');

      anomalies.forEach(anomaly => {
        suggestions.push(`- ${anomaly.message}`);
      });
    }

    if (stats.writeCounts.updateDoc > stats.writeCounts.setDoc * 2) {
      suggestions.push('💡 建議：考慮使用 setDoc 替代頻繁的 updateDoc 操作');
    }

    if (stats.writeCounts.arrayUnion > 10) {
      suggestions.push('💡 建議：考慮批量處理 arrayUnion 操作');
    }

    if (stats.averageWritesPerMinute > 5) {
      suggestions.push('💡 建議：增加防抖機制，減少寫入頻率');
    }

    return suggestions;
  }
}

// 創建全局監控實例
const firebaseWriteMonitor = new FirebaseWriteMonitor();

// 在開發環境中自動啟動監控
if (process.env.NODE_ENV === 'development') {
  firebaseWriteMonitor.start();

  // 每分鐘輸出統計信息
  setInterval(() => {
    const stats = firebaseWriteMonitor.getStats();
    if (stats.totalWrites > 0) {
      console.log('📊 Firebase 寫入統計:', stats);

      const suggestions =
        firebaseWriteMonitor.generateOptimizationSuggestions();
      if (suggestions.length > 0) {
        console.log('💡 優化建議:');
        suggestions.forEach(suggestion => console.log(suggestion));
      }
    }
  }, 60000);
}

export default firebaseWriteMonitor;
