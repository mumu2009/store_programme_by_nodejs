const fs = require('fs');
const path = require('path');
const winston = require('winston');
const { createLogger, format, transports } = winston;

// 引入配置
const config = require('./config');

// 确保日志目录存在
const logDir = path.join(__dirname, config.logDir);
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// 日志级别映射
const levels = {
  levels: {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3
  },
  colors: {
    debug: 'cyan',
    info: 'green',
    warn: 'yellow',
    error: 'red'
  }
};

// 自定义格式
const formatLog = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.align(),
  format.printf(info => `${info.timestamp} ${info.level.toUpperCase()}: ${info.message}`)
);

// 创建日志记录器
const logger = createLogger({
  level: config.level.toLowerCase(),
  levels: levels.levels,
  format: formatLog,
  transports: []
});

// 添加控制台传输
if (config.console) {
  logger.add(new transports.Console({
    level: config.level.toLowerCase(),
    colorize: true,
    prettyPrint: true,
    handleExceptions: true,
    format: format.combine(
      format.colorize({ colors: levels.colors }),
      formatLog
    )
  }));
}

// 添加文件传输
if (config.file) {
  const fileTransport = new transports.File({
    filename: path.join(logDir, config.fileName),
    level: config.level.toLowerCase(),
    handleExceptions: true,
    maxsize: config.rotate.enabled ? 10485760 : 0, // 10MB
    maxFiles: config.rotate.enabled ? config.rotate.files : 0,
    format: formatLog
  });
  logger.add(fileTransport);
}

// 自定义日志方法
['debug', 'info', 'warn', 'error'].forEach(level => {
  logger[level] = (message, ...meta) => {
    logger.log(level, message, ...meta);
  };
});

module.exports = logger;