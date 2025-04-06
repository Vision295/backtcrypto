class Currencies {

  constructor(client) {
    this.client = client  // Removed deprecated options
    this.databaseName = "tcryptoproject";
    this.collectionName = "currencies";
    this.content = null;
    this.database = null;
    this.currenciesCollection = null;
    this.cryptoPrices = {
      SHIB: 0.00001,
      DOGE: 0.06,
      LTC: 70,
      ADA: 0.4,
      DOT: 5,
      SOL: 20,
      AVAX: 15,
      BNB: 300,
      XRP: 0.5,
      ETH: 2000,
      BTC: 30000,
      };
    // Ajout des balances initiales des cryptos
    this.cryptoBalances = {
      SHIB: 0,
      DOGE: 0,
      LTC: 0,
      ADA: 0,
      DOT: 0,
      SOL: 0,
      AVAX: 0,
      BNB: 0,
      XRP: 0,
      ETH: 0,
      BTC: 0,
      };
  }

  async fetchDB() {
    try {
      this.database = await this.client.db(this.databaseName);
      this.currenciesCollection = await this.database.collection(this.collectionName);
    } catch (e) {
      console.error("Error fetching currencies:", e);
    }
  }

  async getContent() {
    try {
      await this.fetchDB()

      this.content = await this.currenciesCollection
        .find({}, { projection: { name: 1, price: 1, _id: 0 } })
        .sort({ price: 1 }) // Sort by price in descending order
        .toArray();
    } catch (e) {
      console.error("Error fetching sorted currencies:", e);
    }
  }

  async updateCryptoPrices() {
    await this.getContent()
    Object.keys(this.cryptoPrices).forEach((crypto) => {
      const currentPrice = this.cryptoPrices[crypto];
      const volatilityFactor = crypto === 'BTC' ? 0.02 : 
                             crypto === 'ETH' ? 0.025 : 
                             crypto === 'SHIB' ? 0.04 : 0.03;
      const variation = (Math.random() * volatilityFactor * 2 - volatilityFactor) * currentPrice;
      const newPrice = Math.max(0.00001, currentPrice + variation); // Empêcher les prix négatifs
      this.cryptoPrices[crypto] = parseFloat(newPrice);
    });
  }
}

module.exports = Currencies;
