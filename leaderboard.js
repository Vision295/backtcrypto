const { MongoClient } = require('mongodb');
require('dotenv').config();

class LeaderBoard {
  constructor() {
<<<<<<< HEAD
    this.uri = process.env.MONGO_URI || 'mongodb://localhost:27017';
    this.databaseName = process.env.DB_NAME || 'crypto_simulator';
    this.collectionName = 'users';
    this.client = new MongoClient(this.uri);
=======
    this.Db = process.env.ATLAS_URI;
    if (!this.Db) { throw new Error("ATLAS_URI is not defined in the environment variables."); }
    this.client = new MongoClient(this.Db); // Removed deprecated options
    this.databaseName = "tcryptoproject";
    this.collectionName = "leaderboard";
    this.content = null; // Initialize users to null
    this.connect();
>>>>>>> 933c945 (addition to the class)
  }

  async connect() {
    try {
      await this.client.connect();
<<<<<<< HEAD
      console.log('Connected to MongoDB for leaderboard operations');
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      throw error;
=======
      console.log("Connected to MongoDB");
    } catch (e) {
      console.error("Error connecting to MongoDB:", e);
    }
  }

  async addUser(name, score) {
    try {
      const database = this.client.db(this.databaseName);
      const usersCollection = database.collection(this.collectionName);
      const existingUser = await usersCollection.findOne({ name });
      const newScore = existingUser ? Math.max(score, existingUser.score) : score;
      const newUser = { name, newScore };
      const result = await usersCollection.insertOne(newUser);
      console.log("User added successfully:", result.insertedId);
      return newScore;
    } catch (e) {
      console.error("Error adding user:", e);
    }
  }

  async getContent() {
    try {
      const database = this.client.db(this.databaseName);
      const usersCollection = database.collection(this.collectionName);
      this.content = await usersCollection.find({}, { projection: { name: 1, score: 1, _id: 0 } }).toArray(); // Project only name and score
      console.log("Users in the database:", this.content);
    } catch (e) {
      console.error("Error listing users:", e);
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