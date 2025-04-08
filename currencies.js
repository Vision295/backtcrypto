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
    await this.getContent(); // Assurez-vous que this.content est peuplé

    // Générer une nouvelle liste de 20 valeurs pour chaque crypto
    const updatedPrices = {};
    this.content.forEach(item => {
      const { name, value } = item;
      const priceHistory = Array.from({ length: 20 }, () =>
        this.computeVariation(value)
      );
      updatedPrices[name] = priceHistory; // Stocker les nouvelles valeurs
    });

    console.log("Updated prices with history:", updatedPrices);

    // Retourner les nouvelles valeurs pour que server.js puisse les envoyer au frontend
    return updatedPrices;
  }
  

  computeVariation(value) {
    const variation = (Math.random() * 0.04 - 0.02) * value; // ±2% variation
    const newValue = parseFloat((value + variation).toFixed(6));
    // console.log(`Computed variation: original=${value}, variation=${variation}, newValue=${newValue}`);
    return newValue; // Return the computed value directly
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
