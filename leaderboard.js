const { MongoClient } = require('mongodb');
require('dotenv').config({ path: './config.env' });

class Leaderboard {

  constructor() {
    this.Db = process.env.ATLAS_URI;
    if (!this.Db) { throw new Error("ATLAS_URI is not defined in the environment variables."); }
    this.client = new MongoClient(this.Db, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    this.databaseName = "tcryptoproject";
    this.collectionName = "leaderboard";
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
      const newUser = { name, score };
      const result = await usersCollection.insertOne(newUser);
      console.log("User added successfully:", result.insertedId);
    } catch (e) {
      console.error("Error adding user:", e);
    }
  }

  async listUsers() {
    try {
      const database = this.client.db(this.databaseName);
      const usersCollection = database.collection(this.collectionName);
      const users = await usersCollection.find({}, { projection: { name: 1, score: 1, _id: 0 } }).toArray(); // Project only name and score
      console.log("Users in the database:", users);
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
