const express = require('express');
const cors = require('cors'); // Import CORS
const LeaderBoard = require('./leaderboard'); // Correctly import the Users class
const Currencies = require('./currencies'); // Import the Currencies class
require('dotenv').config();

const app = express();
const port = 5000;
const ipAddress = 'localhost'; // Revert to localhost

app.use(cors()); // Enable CORS
app.use(express.json()); // Middleware pour parser le JSON

let cachedUsers = [];
let cachedCurrencies = [];

// Function to periodically fetch users
async function fetchUsersPeriodically() {
  const leaderboard = new LeaderBoard();
  try {
    await leaderboard.connect();
    const database = leaderboard.client.db(leaderboard.databaseName);
    const usersCollection = database.collection(leaderboard.collectionName);
    cachedUsers = await usersCollection.find({}, { projection: { name: 1, score: 1, _id: 0 } }).sort({ score: -1 }).toArray(); // Sort by score descending
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

    console.log("Fetched users from database:", userList); // Log fetched users
    res.json(userList);
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

app.post('/api/users', async (req, res) => {
  const { name, score } = req.body;
  if (!name || typeof score !== "number") {
    return res.status(400).json({ error: "Invalid data" });
  }

  const leaderboard = new LeaderBoard();
  try {
    await leaderboard.connect();
    const database = leaderboard.client.db(leaderboard.databaseName);
    const usersCollection = database.collection(leaderboard.collectionName);

    const existingUser = await usersCollection.findOne({ name });
    const newScore = existingUser ? Math.max(score, existingUser.score) : score;

    const result = await usersCollection.updateOne(
      { name },
      { $set: { score: newScore } },
      { upsert: true }
    );
    console.log(`User ${name} updated with score: ${newScore}`);
    res.json({ success: true, result });
  } catch (error) {
    console.error("Error updating user score:", error);
    res.status(500).json({ error: "Failed to update user score" });
  } finally {
    await leaderboard.close();
  }
});

app.listen(port, ipAddress, () => {
  console.log(`Server running at http://${ipAddress}:${port}`);
});
