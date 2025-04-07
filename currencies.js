class Currencies {

  constructor(client) {
    this.client = client  // Removed deprecated options
    this.content = null;
    this.database = null;
    this.currenciesCollection = null;
    this.eventsCollection = null;
    this.event = null;
  }

  async fetchDB() {
    try {
      this.database = await this.client.db("tcryptoproject");
      this.currenciesCollection = await this.database.collection("currencies");
      this.eventsCollection = await this.database.collection("events");
    } catch (e) {
      console.error("Error fetching currencies:", e);
    }
  }

  async getContent() {
    try {
      await this.fetchDB()

      this.content = await this.currenciesCollection
        .find({}, { projection: { name: 1, value: 1, available: 1, total: 1, volatility: 1, _id: 0 } })
        .sort({ price: 1 }) // Sort by price in descending order
        .toArray();
    } catch (e) {
      console.error("Error fetching sorted currencies:", e);
    }
  }

  async updateCryptoPrices() {
    await this.getContent(); // Ensure this.content is populated as an array

    // Apply computeVariation directly to this.content
    this.content = this.content.map(item => {
      const { name, value, total, available, volatility } = item;
      return {
        ...item,
        value: this.computeVariation(name, value, total, available, volatility) // Use the resolved value
      };
    });

    console.log("prices are : ", this.content);

    await this.sendContent();
  }

  async sendContent() {
      for (const item of this.content) {
        const { name, value, total, available, volatility } = item;

        await this.currenciesCollection.updateOne(
          { name: name },
          { $set: { value } }
        );
      }
  }

  computeVariation(name, value, total, available, volatility) {
    if (this.event) {
      if (this.event.name === name) {
        volatility = this.event.volatility;
      }
    }
    const variation = (Math.random() * 0.04 - 0.02) * value; // ±2% variation
    return value + variation; // Return the computed value directly
  }

  async getRandomEvent() {
      try {
        await this.fetchDB()
        const randomEvent = await this.eventsCollection.aggregate([{ $sample: { size: 1 } }]).toArray();
        this.event = randomEvent[0];
      } catch (e) {
        console.error("Error fetching random event:", e);
        return null;
      }
  }
}

module.exports = Currencies;
