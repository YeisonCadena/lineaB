const fs = require('fs');
const path = require('path');

// Crear carpeta de logs si no existe
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

class Logger {
  log(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...meta
    };

    // Console output
    const color = this.getColorForLevel(level);
    console.log(
      `${color}[${timestamp}] [${level}]${color === '\x1b[0m' ? '' : ' '}\x1b[0m ${message}`,
      Object.keys(meta).length > 0 ? meta : ''
    );

    // File output
    try {
      fs.appendFileSync(
        path.join(logsDir, `${level.toLowerCase()}.log`),
        JSON.stringify(logEntry) + '\n'
      );
      
      // All logs en archivo combinado
      fs.appendFileSync(
        path.join(logsDir, 'app.log'),
        JSON.stringify(logEntry) + '\n'
      );
    } catch (err) {
      console.error('Error escribiendo log:', err.message);
    }
  }

  getColorForLevel(level) {
    const colors = {
      'INFO': '\x1b[36m',    // Cyan
      'ERROR': '\x1b[31m',   // Red
      'WARN': '\x1b[33m',    // Yellow
      'DEBUG': '\x1b[35m',   // Magenta
      'SUCCESS': '\x1b[32m'  // Green
    };
    return colors[level] || '\x1b[0m';
  }

  info(message, meta) {
    this.log('INFO', message, meta);
  }

  error(message, meta) {
    this.log('ERROR', message, meta);
  }

  warn(message, meta) {
    this.log('WARN', message, meta);
  }

  debug(message, meta) {
    this.log('DEBUG', message, meta);
  }

  success(message, meta) {
    this.log('SUCCESS', message, meta);
  }
}

module.exports = new Logger();
