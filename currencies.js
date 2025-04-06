const { MongoClient } = require('mongodb');
require('dotenv').config();

class Currencies {
  constructor() {
<<<<<<< HEAD
    this.uri = process.env.MONGO_URI || 'mongodb://localhost:27017';
    this.databaseName = process.env.DB_NAME || 'crypto_simulator';
    this.collectionName = 'currencies';
    this.marketDataCollection = 'market_data';
    this.client = new MongoClient(this.uri);
=======
    this.Db = process.env.ATLAS_URI;
    if (!this.Db) { throw new Error("ATLAS_URI is not defined in the environment variables."); }
    this.client = new MongoClient(this.Db); // Removed deprecated options
    this.databaseName = "tcryptoproject";
    this.collectionName = "currencies";
    this.currencies = null; // Initialize currencies to null
    this.connect();
>>>>>>> 933c945 (addition to the class)
  }

  async connect() {
    try {
      await this.client.connect();
<<<<<<< HEAD
      console.log('Connected to MongoDB for currency operations');
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      throw error;
=======
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
>>>>>>> 933c945 (addition to the class)
    }
  }

  async close() {
    try {
      await this.client.close();
      console.log('Disconnected from MongoDB');
    } catch (error) {
      console.error('Error closing MongoDB connection:', error);
    }
  }

  async fetchAllCurrencies() {
    try {
      const database = this.client.db(this.databaseName);
      const collection = database.collection(this.collectionName);
      
      return await collection.find({}).toArray();
    } catch (error) {
      console.error('Error fetching all currencies:', error);
      throw error;
    }
  }

  async getCurrentPrices() {
    try {
      const database = this.client.db(this.databaseName);
      const collection = database.collection(this.marketDataCollection);
      
      const latestMarketData = await collection.findOne({}, { sort: { timestamp: -1 } });
      return latestMarketData?.cryptoPrices || {};
    } catch (error) {
      console.error('Error fetching current prices:', error);
      throw error;
    }
  }

  async getPriceHistory() {
    try {
      const database = this.client.db(this.databaseName);
      const collection = database.collection(this.marketDataCollection);
      
      const latestMarketData = await collection.findOne({}, { sort: { timestamp: -1 } });
      return latestMarketData?.priceHistory || {};
    } catch (error) {
      console.error('Error fetching price history:', error);
      throw error;
    }
  }

  async updateMarketData(marketData) {
    try {
      const database = this.client.db(this.databaseName);
      const collection = database.collection(this.marketDataCollection);
      
      return await collection.insertOne({
        ...marketData,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error updating market data:', error);
      throw error;
    }
  }
}

module.exports = Currencies;