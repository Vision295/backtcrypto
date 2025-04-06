class Currencies {

  constructor(client) {
    this.client = client  // Removed deprecated options
    this.databaseName = "tcryptoproject";
    this.collectionName = "currencies";
    this.content = null;
  }

  async getContent() {
    try {
      const database = this.client.db(this.databaseName);
      const currenciesCollection = database.collection(this.collectionName);
      this.content = await currenciesCollection.find({}, { projection: { name: 1, value: 1, total: 1, available: 1, _id: 0 } }).toArray();
    } catch (e) {
      console.error("Error fetching currencies:", e);
      throw e;
    }
  }
}

module.exports = Currencies;
