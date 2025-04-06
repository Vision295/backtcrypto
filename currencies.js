const { MongoClient } = require('mongodb');
require('dotenv').config({ path: './config.env' });

class Currencies {

  constructor() {
    this.Db = process.env.ATLAS_URI;
    if (!this.Db) { throw new Error("ATLAS_URI is not defined in the environment variables."); }
    this.client = new MongoClient(this.Db); // Removed deprecated options
    this.databaseName = "tcryptoproject";
    this.collectionName = "currencies";
    this.currencies = null; // Initialize currencies to null
    this.connect();
  }

  async connect() {
    try {
      await this.client.connect();
      console.log("Connected to MongoDB");
    } catch (e) {
      console.error("Error connecting to MongoDB:", e);
    }
  }

  async getContent() {
    try {
      const database = this.client.db(this.databaseName);
      const currenciesCollection = database.collection(this.collectionName);
      this.content = await currenciesCollection.find({}, { projection: { name: 1, value: 1, total: 1, available: 1, _id: 0 } }).toArray();
      console.log("Currencies in the database:", this.content);
    } catch (e) {
      console.error("Error fetching currencies:", e);
    }
  }

  async close() {
    try {
      await this.client.close();
      console.log("Connection to MongoDB closed");
    } catch (e) {
      console.error("Error closing connection:", e);
    }
  }
}

module.exports = Currencies;
