function LoggerConst(logLevel) {
    return {
      logLevel: logLevel,
      log: function (level, ...message) {
        if (level <= this.logLevel) {
          console.log(...message);
        }
      },
      error: function (level, ...message) {
        if (level <= this.logLevel) {
          console.error(...message);
        }
      }
    }
  }
  
  module.exports = LoggerConst;