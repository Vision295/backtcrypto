class Leaderboard {

  constructor(client) {
    this.client = client  // Removed deprecated options
    this.databaseName = "tcryptoproject";
    this.collectionName = "leaderboard";
    this.content = null;
    this.database = null;
    this.usersCollection = null;
  }

  async fetchDB() {
    try {
      this.database = await this.client.db(this.databaseName);
      this.usersCollection = await this.database.collection(this.collectionName);
    } catch (e) {
      console.error("Error listing users:", e);
    }
  }

  async addUser(name, score) {
    try {
      await this.fetchDB()

      const existingUser = await this.usersCollection.findOne({ name });
      const newScore = existingUser ? Math.max(score, existingUser.score) : score;

      await this.usersCollection.updateOne(
            { name },
            { $set: { score: newScore } },
            { upsert: true }
      );
      console.log("User added successfully");
    } catch (e) {
      console.error("Error adding user:", e);
    }
  }

  async getSortedContent() {
      await this.fetchDB()
      this.content = await this.usersCollection
            .find({}, { projection: { name: 1, score: 1, _id: 0 } })
            .sort({ score: -1 }) // Tri décroissant par score
            .toArray();
  }
}

module.exports = Leaderboard; // Export the Users class
