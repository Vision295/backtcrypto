const { MongoClient } = require('mongodb');
require('dotenv').config({ path: './config.env' });

class Currencies {
  constructor() {
    this.uri = process.env.MONGO_URI || 'mongodb://localhost:27017';
    this.databaseName = process.env.DB_NAME || 'crypto_simulator';
    this.collectionName = 'currencies';
    this.marketDataCollection = 'market_data';
    this.client = new MongoClient(this.uri);
  }

  async connect() {
    try {
      await this.client.connect();
      console.log('Connected to MongoDB for currency operations');
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      throw error;
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