const { MongoClient } = require('mongodb');
require('dotenv').config({ path: './config.env' });

class LeaderBoard {
  constructor() {
    this.uri = process.env.MONGO_URI || 'mongodb://localhost:27017';
    this.databaseName = process.env.DB_NAME || 'crypto_simulator';
    this.collectionName = 'users';
    this.client = new MongoClient(this.uri);
  }

  async connect() {
    try {
      await this.client.connect();
      console.log('Connected to MongoDB for leaderboard operations');
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

  async getUsersByScore() {
    try {
      const database = this.client.db(this.databaseName);
      const collection = database.collection(this.collectionName);
      
      return await collection
        .find({}, { projection: { name: 1, score: 1, _id: 0 } })
        .sort({ score: -1 })
        .toArray();
    } catch (error) {
      console.error('Error getting users by score:', error);
      throw error;
    }
  }

  async updateUserScore(name, score) {
    try {
      const database = this.client.db(this.databaseName);
      const collection = database.collection(this.collectionName);
      
      const existingUser = await collection.findOne({ name });
      const newScore = existingUser ? Math.max(score, existingUser.score) : score;
      
      return await collection.updateOne(
        { name },
        { $set: { score: newScore, lastUpdated: new Date() } },
        { upsert: true }
      );
    } catch (error) {
      console.error('Error updating user score:', error);
      throw error;
    }
  }
}

module.exports = LeaderBoard;