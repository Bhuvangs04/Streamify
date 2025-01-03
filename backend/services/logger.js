const winston = require("winston");
const { ElasticsearchTransport } = require("winston-elasticsearch");

// Elasticsearch configuration
const esTransportOpts = {
  level: "info",
  clientOpts: {
    node: "http://localhost:9200", // Replace with your Elasticsearch endpoint
  },
};

// Create the logger
const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new ElasticsearchTransport(esTransportOpts),
    new winston.transports.Console(),
  ],
});

module.exports = logger;
