const express = require('express');
const cors = require('cors'); // Import CORS
const LeaderBoard = require('./leaderboard'); // Correctly import the Users class
const Currencies = require('./currencies'); // Import the Currencies class
require('dotenv').config();

const app = express();
const port = 5000;
const ipAddress = 'localhost'; // Listen on all network interfaces

app.use(cors()); // Enable CORS
app.use(express.json()); // Add this middleware to parse JSON request bodies

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
      .sort({ score: -1 }) // Tri décroissant par score
      .toArray();

    res.json(userList); // Envoyer les données triées
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.get('/api/currencies', (req, res) => {
  res.json(currencies.content);
});

app.get('/api/crypto-prices', (req, res) => {
  res.json(cryptoPrices);
});

app.post('/api/users', async (req, res) => {
  const { name, score } = req.body;
  if (!name || typeof score !== "number") {
    return res.status(400).json({ error: "Invalid data" });
  }

  try {
    const newScore = leaderboard.addUser(name, score);
    console.log(`User ${name} updated with score: ${newScore}`);
    res.json({ success: true, result });
  } catch (error) {
    console.error("Error updating user score:", error);
    res.status(500).json({ error: "Failed to update user score" });
  } 
});

app.listen(port, ipAddress, () => {
  console.log(`Server running at http://${ipAddress}:${port}`);
});
