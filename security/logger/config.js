module.exports = {
    level: 'INFO', // 日志级别: DEBUG, INFO, WARN, ERROR
    console: true, // 是否输出到控制台
    file: true,    // 是否输出到文件
    logDir: './logs/', // 日志文件目录
    fileName: 'app.log', // 日志文件名
    rotate: {
      enabled: true, // 是否启用日志滚动
      size: '10MB',  // 滚动大小
      files: 5       // 保留文件数量
    }
  };