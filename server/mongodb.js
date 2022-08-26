const { MongoClient } = require("mongodb");
const { log4js } = require("./logger");
const logger = log4js.getLogger("Location: Server. File: mongodb.js");

// Connection URL
const url = "mongodb://localhost:27017";
const client = new MongoClient(url);

// Database Name
const dbName = "logs";

async function main() {
  await client.connect();
  const db = client.db(dbName);
  const collection = db.collection("logs");
  logger.info("Connected to MongoDB.");
}

main()
  .catch(console.error)
  .finally(() => client.close());

module.exports = { main };
