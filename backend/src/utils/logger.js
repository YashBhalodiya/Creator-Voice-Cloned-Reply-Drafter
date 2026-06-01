const levels = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

class Logger {
  constructor() {
    this.level = process.env.NODE_ENV === 'production' ? levels.INFO : levels.DEBUG;
  }

  format(level, message, meta) {
    const timestamp = new Date().toISOString();
    let metaStr = '';
    
    if (meta !== undefined && meta !== null) {
      if (meta instanceof Error) {
        metaStr = `\n${meta.stack}`;
      } else {
        try {
          metaStr = ` | ${JSON.stringify(meta)}`;
        } catch (e) {
          metaStr = ` | [Unserializable Meta]`;
        }
      }
    }
    
    return `[${timestamp}] [${level}] ${message}${metaStr}`;
  }

  error(message, meta) {
    if (this.level >= levels.ERROR) {
      console.error(this.format('ERROR', message, meta));
    }
  }

  warn(message, meta) {
    if (this.level >= levels.WARN) {
      console.warn(this.format('WARN', message, meta));
    }
  }

  info(message, meta) {
    if (this.level >= levels.INFO) {
      console.log(this.format('INFO', message, meta));
    }
  }

  debug(message, meta) {
    if (this.level >= levels.DEBUG) {
      console.log(this.format('DEBUG', message, meta));
    }
  }
}

export const logger = new Logger();
export default logger;
