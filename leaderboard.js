const { MongoClient } = require('mongodb');
require('dotenv').config({ path: './config.env' });

class Leaderboard {

  constructor() {
    this.Db = process.env.ATLAS_URI;
    if (!this.Db) { throw new Error("ATLAS_URI is not defined in the environment variables."); }
    this.client = new MongoClient(this.Db); // Removed deprecated options
    this.databaseName = "tcryptoproject";
    this.collectionName = "leaderboard";
    this.content = null; // Initialize users to null
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

module.exports = Leaderboard; // Export the Users class
