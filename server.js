const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
require('dotenv').config();

// Server configuration
const app = express();
const port = process.env.PORT || 5000;
const ip = process.env.IP || "0.0.0.0"; // Listen on all network interfaces

// MongoDB configuration
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'crypto_simulator';
const USERS_COLLECTION = 'users';
const MARKET_COLLECTION = 'market_data';

// Middleware
app.use(cors());
app.use(bodyParser.json());

// In-memory cache for performance
let cachedUsers = [];
let marketData = {
  // Initial crypto prices based on App.js
  cryptoPrices: {
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
  },
  // Track total players and their balances for market influence
  totalPlayers: 0,
  totalUSDBalance: 0,
  priceHistory: {}
};

// Initialize price history with 20 data points for each crypto
Object.keys(marketData.cryptoPrices).forEach(crypto => {
  marketData.priceHistory[crypto] = Array(20).fill(marketData.cryptoPrices[crypto]);
});

/**
 * MongoDB connection helper class
 */
class DatabaseConnection {
  constructor() {
    this.client = null;
    this.uri = MONGO_URI;
  }

  async connect() {
    if (!this.client) {
      this.client = new MongoClient(this.uri);
      await this.client.connect();
      console.log('Connected to MongoDB');
    }
    return this.client;
  }

  async close() {
    if (this.client) {
      await this.client.close();
      this.client = null;
      console.log('Disconnected from MongoDB');
    }
  }

  getDb() {
    return this.client.db(DB_NAME);
  }
}

/**
 * Update cryptocurrency prices based on market activity
 * This simulates market forces based on player activity
 */
async function updateCryptoPrices() {
  const db = new DatabaseConnection();
  try {
    await db.connect();
    const database = db.getDb();
    const marketCollection = database.collection(MARKET_COLLECTION);
    
    // Get the latest market data
    const latestMarketData = await marketCollection.findOne({}, { sort: { timestamp: -1 } });
    if (latestMarketData) {
      Object.assign(marketData, latestMarketData);
    }

    const previousPrices = { ...marketData.cryptoPrices };
    
    // Update each cryptocurrency price
    Object.keys(marketData.cryptoPrices).forEach(crypto => {
      const currentPrice = marketData.cryptoPrices[crypto];
      
      // Base volatility factors - lower value cryptos tend to be more volatile
      let volatilityFactor;
      if (currentPrice < 0.01) volatilityFactor = 0.04;       // SHIB-like
      else if (currentPrice < 1) volatilityFactor = 0.035;    // DOGE, XRP-like
      else if (currentPrice < 100) volatilityFactor = 0.03;   // MID caps (DOT, LTC, etc)
      else if (currentPrice < 1000) volatilityFactor = 0.025; // BNB-like
      else volatilityFactor = 0.02;                           // BTC, ETH-like
      
      // Market influence factor - more players with higher balances can affect the market
      // This creates a feedback loop similar to real markets
      const marketFactor = Math.min(
        0.005, 
        (marketData.totalPlayers * marketData.totalUSDBalance) / 10000000000
      );
      
      // Combined volatility
      const effectiveVolatility = volatilityFactor + marketFactor;
      
      // Random price movement with slight upward bias (simulating long-term growth)
      const randomFactor = 0.985 + Math.random() * effectiveVolatility * 2;
      
      // Calculate new price with limits to prevent extreme changes
      let newPrice = currentPrice * randomFactor;
      
      // Ensure price doesn't change too drastically in one update
      newPrice = Math.max(currentPrice * 0.9, Math.min(newPrice, currentPrice * 1.1));
      
      // Save with appropriate decimal precision based on price magnitude
      if (newPrice < 0.01) {
        marketData.cryptoPrices[crypto] = parseFloat(newPrice.toFixed(8));
      } else if (newPrice < 1) {
        marketData.cryptoPrices[crypto] = parseFloat(newPrice.toFixed(6));
      } else if (newPrice < 100) {
        marketData.cryptoPrices[crypto] = parseFloat(newPrice.toFixed(4));
      } else {
        marketData.cryptoPrices[crypto] = parseFloat(newPrice.toFixed(2));
      }
      
      // Update price history
      marketData.priceHistory[crypto] = [
        ...marketData.priceHistory[crypto].slice(-19),
        marketData.cryptoPrices[crypto]
      ];
    });
    
    // Save updated market data to database
    await marketCollection.insertOne({
      ...marketData,
      timestamp: new Date()
    });
    
    console.log("Crypto prices updated:", JSON.stringify(marketData.cryptoPrices));
    await leaderboard.connect();
    const database = leaderboard.client.db(leaderboard.databaseName);
    const usersCollection = database.collection(leaderboard.collectionName);
    cachedUsers = await usersCollection.find({}, { projection: { name: 1, score: 1, _id: 0 } }).toArray();
    console.log("Periodically fetched users:", cachedUsers);
  } catch (error) {
    console.error('Error fetching users periodically:', error);
  } 
}

// Function to periodically fetch currencies
async function fetchCurrenciesPeriodically() {
  const currencies = new Currencies();
  try {
    await currencies.connect();
    cachedCurrencies = await currencies.fetchAllCurrencies();
    console.log("Periodically fetched currencies:", cachedCurrencies);
  } catch (error) {
    console.error('Error updating crypto prices:', error);
  } finally {
    await db.close();
  }
    console.error('Error fetching currencies periodically:', error);
  } 
let cachedCurrencies = [];
// Mise à jour des prix des cryptos pour correspondre au frontend
let cryptoPrices = {
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
let cryptoBalances = {
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

let leaderboard = new LeaderBoard();
let currencies = new Currencies();

function updateCryptoPrices() {
  Object.keys(cryptoPrices).forEach((crypto) => {
    const currentPrice = cryptoPrices[crypto];
    const variation = (Math.random() * 0.04 - 0.02) * currentPrice; // ±2% variation
    const newPrice = Math.max(0.5, Math.min(currentPrice + variation, currentPrice * 1.1)); // Limit growth/decay
    cryptoPrices[crypto] = parseFloat(newPrice.toFixed(2));
  });
}

// Route pour récupérer les balances des cryptos
// TODO : changeer ça !
app.get('/api/crypto-balances', (req, res) => {
  res.json(cryptoBalances);
});



// Mise à jour des prix des cryptos avec des variations réalistes
function updateCryptoPrices() {
  Object.keys(cryptoPrices).forEach((crypto) => {
    const currentPrice = cryptoPrices[crypto];
    const volatilityFactor = crypto === 'BTC' ? 0.02 : 
                             crypto === 'ETH' ? 0.025 : 
                             crypto === 'SHIB' ? 0.04 : 0.03;
    const variation = (Math.random() * volatilityFactor * 2 - volatilityFactor) * currentPrice;
    const newPrice = Math.max(0.00001, currentPrice + variation); // Empêcher les prix négatifs
    cryptoPrices[crypto] = parseFloat(newPrice.toFixed(6));
  });
}

// Schedule periodic fetching every 5 minutes (300,000 ms)
setInterval(currencies.getContent, 500);
setInterval(leaderboard.getContent, 300);
setInterval(updateCryptoPrices, 5000); // Update prices every 5 seconds

app.get('/api/users', async (req, res) => {
  try {
    // Récupérer les utilisateurs triés par score décroissant
    const userList = await leaderboard.content
      .find({}, { projection: { name: 1, score: 1, _id: 0 } })
      .sort({ score: -1 })
      .toArray();
    
    // Update market data based on user stats
    marketData.totalPlayers = cachedUsers.length;
    marketData.totalUSDBalance = cachedUsers.reduce((total, user) => total + user.score, 0);
    
    console.log(`Updated user cache: ${cachedUsers.length} users, total balance: $${marketData.totalUSDBalance}`);
  } catch (error) {
    console.error('Error fetching users:', error);
  } 
}

// Initialize data and schedule periodic updates
async function initialize() {
  // Initial data fetch
  await fetchUsersPeriodically();
  await updateCryptoPrices();
  
  // Schedule periodic fetching - users every 2 seconds, prices every 5 seconds
  setInterval(fetchUsersPeriodically, 2000);
  setInterval(updateCryptoPrices, 5000);
}

// API Routes

// Get all users for leaderboard
app.get('/api/users', (req, res) => {
  res.json(cachedUsers);
});

app.get('/api/currencies', (req, res) => {
  res.json(currencies.content);
});

app.get('/api/crypto-prices', (req, res) => {
  res.json(marketData.cryptoPrices);
});

// Get price history for charts
app.get('/api/price-history', (req, res) => {
  res.json(marketData.priceHistory);
});

// Update or create user score
app.post('/api/users', async (req, res) => {
  const { name, score } = req.body;
  
  // Validate input
  if (!name || typeof score !== "number" || score < 0) {
    return res.status(400).json({ error: "Invalid data" });
  }

<<<<<<< HEAD
<<<<<<< HEAD
  const db = new DatabaseConnection();
  try {
    await db.connect();
    const database = db.getDb();
    const usersCollection = database.collection(USERS_COLLECTION);

    // Find existing user
    const existingUser = await usersCollection.findOne({ name });
    
    // Update with max score (only increase, never decrease)
    const newScore = existingUser ? Math.max(score, existingUser.score) : score;

    // Update or insert user
    const result = await usersCollection.updateOne(
      { name },
      { $set: { score: newScore, lastUpdated: new Date() } },
      { upsert: true }
    );
    
=======
  try {
    const newScore = leaderboard.addUser(name, score);
>>>>>>> 933c945 (addition to the class)
=======
  try {
    const newScore = leaderboard.addUser(name, score);
>>>>>>> 933c9454ed8713a1cff6b8f0fe3dc719d63f7572
    console.log(`User ${name} updated with score: ${newScore}`);
    
    // Trigger immediate user cache update
    await fetchUsersPeriodically();
    
    res.json({ success: true, name, score: newScore });
  } catch (error) {
    console.error("Error updating user score:", error);
    res.status(500).json({ error: "Failed to update user score" });
  } 
});

// Start server
app.listen(port, ip, () => {
  console.log(`Crypto Market Server running at http://${ip}:${port}`);
  initialize();
});