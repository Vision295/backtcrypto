const express = require('express');
const cors = require('cors'); // Import CORS
const LeaderBoard = require('./leaderboard'); // Correctly import the Users class
const Currencies = require('./currencies'); // Import the Currencies class
require('dotenv').config();

const app = express();
const port = 5000;
const ip = "0.0.0.0"; // Listen on all network interfaces

app.use(cors()); // Enable CORS

let cachedUsers = [];
let cachedCurrencies = [];

// Function to periodically fetch users
async function fetchUsersPeriodically() {
  const leaderboard = new LeaderBoard();
  try {
    await leaderboard.connect();
    const database = leaderboard.client.db(leaderboard.databaseName);
    const usersCollection = database.collection(leaderboard.collectionName);
    cachedUsers = await usersCollection.find({}, { projection: { name: 1, score: 1, _id: 0 } }).toArray();
    console.log("Periodically fetched users:", cachedUsers);
  } catch (error) {
    console.error('Error fetching users periodically:', error);
  } finally {
    await leaderboard.close();
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
    console.error('Error fetching currencies periodically:', error);
  } finally {
    await currencies.close();
  }
}

// Schedule periodic fetching every 5 minutes (300,000 ms)
setInterval(fetchUsersPeriodically, 500);
setInterval(fetchCurrenciesPeriodically, 300);


// Initial fetch to populate caches
fetchUsersPeriodically();
fetchCurrenciesPeriodically();

app.get('/api/users', async (req, res) => {
  const leaderboard = new LeaderBoard();
  try {
    await leaderboard.connect();
    const database = leaderboard.client.db(leaderboard.databaseName);
    const usersCollection = database.collection(leaderboard.collectionName);

    // Récupérer les utilisateurs triés par score décroissant
    const userList = await usersCollection
      .find({}, { projection: { name: 1, score: 1, _id: 0 } })
      .sort({ score: -1 }) // Tri décroissant par score
      .toArray();

    res.json(userList); // Envoyer les données triées
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  } finally {
    await leaderboard.close();
  }
});

app.get('/api/currencies', (req, res) => {
  console.log("Sending cached currencies:", cachedCurrencies); // Debugging log
  res.json(cachedCurrencies);
});

app.listen(port, ip, () => {
  console.log(`Server running at http://${ip}:${port}`);
});
