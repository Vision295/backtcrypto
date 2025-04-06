class Leaderboard {

  constructor(client) {
    this.client = client  // Removed deprecated options
    this.databaseName = "tcryptoproject";
    this.collectionName = "leaderboard";
    this.content = null;
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

  async getContent() {
    try {
      const database = this.client.db(this.databaseName);
      const usersCollection = database.collection(this.collectionName);
      this.content = await usersCollection.find({}, { projection: { name: 1, score: 1, _id: 0 } }).toArray();
    } catch (e) {
      console.error("Error listing users:", e);
    }
  }

}

module.exports = Leaderboard; // Export the Users class
