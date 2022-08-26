const log4js = require("log4js"),
  mongoAppender = require("log4js-node-mongodb");

// Configure Logging to logs collection
log4js.addAppender(
  mongoAppender.appender({
    connectionString: "localhost:27017/logs",
    collectionName: "logs",
  })
);

module.exports = { log4js };
