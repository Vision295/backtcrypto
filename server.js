const express = require('express');
const cors = require('cors'); // Import CORS
const LeaderBoard = require('./leaderboard'); // Correctly import the Users class
const Currencies = require('./currencies'); // Import the Currencies class
require('dotenv').config();

const app = express();
const port = 5000;
const ipAddress = 'localhost'; // Revert to localhost

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

app.get('/api/users', (req, res) => {
  console.log("Sending cached users:", cachedUsers); // Debugging log
  res.json(cachedUsers);
});

app.get('/api/currencies', (req, res) => {
  console.log("Sending cached currencies:", cachedCurrencies); // Debugging log
  res.json(cachedCurrencies);
});

app.listen(port, ipAddress, () => {
  console.log(`Server running at http://${ipAddress}:${port}`);
});
