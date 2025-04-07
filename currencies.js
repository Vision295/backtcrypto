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

    // Generate a list of 20 values for each cryptocurrency in the desired format
    const updatedPrices = {};
    this.content.forEach(item => {
      const { name, value } = item;
      const priceHistory = Array.from({ length: 20 }, () =>
        this.computeVariation(value)
      );
      updatedPrices[name] = priceHistory; // Ensure it's an array of 20 values
    });

    console.log("Updated prices with history:", updatedPrices);

    await this.sendContent(updatedPrices);
  }

  async sendContent(updatedPrices) {
    for (const [name, priceHistory] of Object.entries(updatedPrices)) {
      await this.currenciesCollection.updateOne(
        { name: name },
        { $set: { priceHistory } }
      );
    }
  }

  computeVariation(value) {
    const variation = (Math.random() * 0.04 - 0.02) * value; // ±2% variation
    return parseFloat((value + variation).toFixed(6)); // Return the computed value directly
  }

  async getRandomEvent() {
      try {
        await this.fetchDB()
        const randomEvent = await this.eventsCollection.aggregate([{ $sample: { size: 1 } }]).toArray();
        this.event = randomEvent[0];
        this.applyEvent();
      } catch (e) {
        console.error("Error fetching random event:", e);
        return null;
      }
  }

  async applyEvent() {

  }
}

module.exports = Currencies;
