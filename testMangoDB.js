const { MongoClient } = require('mongodb');
require('dotenv').config({ path: './config.env' });

class Users {
  constructor() {
    this.Db = process.env.ATLAS_URI;
    if (!this.Db) {
      throw new Error("ATLAS_URI is not defined in the environment variables.");
    }
    this.client = new MongoClient(this.Db, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    this.databaseName = "tcrypto";
    this.collectionName = "users";
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

module.exports = Users; // Export the Users class

// Example usage
(async () => {
  const users = new Users();
  await users.connect();
  await users.addUser("Alice", 100); // Add a user
  await users.listUsers(); // List all users
  await users.close();
})();