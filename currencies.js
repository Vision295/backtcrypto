const { log } = require("console");

class Currencies {
  constructor(client) {
    this.client = client;
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
      await this.fetchDB();

      this.content = await this.currenciesCollection
        .find({}, { projection: { name: 1, symbol: 1, value: 1, available: 1, total: 1, volatility: 1, priceHistory: 1, _id: 0 } })
        .sort({ price: 1 })
        .toArray();
    } catch (e) {
      console.error("Error fetching sorted currencies:", e);
    }
  }

  async updateCryptoPrices() {
    await this.getContent();

    const updatedPrices = {};
    for (const item of this.content) {
      const { symbol, value, priceHistory, volatility } = item;
      
      //console.log("Current item:", item); 

      // Compute the next price based on the last value in priceHistory
      const lastPrice = priceHistory[priceHistory.length - 1];
      const newPrice = this.computeVariation(lastPrice, volatility);

      // Update the priceHistory array
      priceHistory.push(newPrice);
      if (priceHistory.length > 20) priceHistory.shift(); // Delete the first value

      // Update the database with the new priceHistory
      await this.currenciesCollection.updateOne(
        { symbol },
        { $set: { priceHistory } }
      );

      updatedPrices[symbol] = priceHistory; // Store the updated priceHistory
    }
    return updatedPrices;
  }

  computeVariation(value, volatility) {
    const variation = (Math.random() * 2 * volatility - volatility) * value; // ±volatility% variation
    return parseFloat((value + variation).toFixed(6));
  }

  async getRandomEvent() {
    try {
      await this.fetchDB();
      const randomEvent = await this.eventsCollection.aggregate([{ $sample: { size: 1 } }]).toArray();
      this.event = randomEvent[0];
      console.log(this.event);
      return this.event;
    } catch (e) {
      console.error("Error fetching random event:", e);
      return null;
    }
  }

  async applyEventVolatility(event) {
    try {
      const { acronym, new_volatility, duration } = event;

      // Fetch the current currency data
      const currency = await this.currenciesCollection.findOne({ symbol: acronym });
      if (!currency) {
        console.error(`Currency with symbol ${acronym} not found.`);
        return;
      }

      // Store the original volatility
      const originalVolatility = currency.volatility;

      // Update the volatility to the new value
      await this.currenciesCollection.updateOne(
        { symbol: acronym },
        { $set: { volatility: new_volatility } }
      );
      console.log(`Volatility for ${acronym} updated to ${new_volatility} for ${duration}ms.`);

      // Revert the volatility back to the original value after the duration
      setTimeout(async () => {
        await this.currenciesCollection.updateOne(
          { symbol: acronym },
          { $set: { volatility: originalVolatility } }
        );
        console.log(`Volatility for ${acronym} reverted to ${originalVolatility}.`);
      }, duration);
    } catch (e) {
      console.error("Error applying event volatility:", e);
    }
  }
}

module.exports = Currencies;
