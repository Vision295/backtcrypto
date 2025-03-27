const express = require('express');
const cors = require('cors'); // Import CORS
const LeaderBoard = require('./leaderBoard'); // Correctly import the Users class
require('dotenv').config();

const app = express();
const port = 5000;

app.use(cors()); // Enable CORS

app.get('/api/users', async (req, res) => {
  const leaderBoard = new LeaderBoard();
  try {
    await leaderBoard.connect();
    const database = leaderBoard.client.db(leaderBoard.databaseName);
    const usersCollection = database.collection(leaderBoard.collectionName);
    const userList = await usersCollection.find({}, { projection: { name: 1, score: 1, _id: 0 } }).toArray();
    console.log("Fetched users from database:", userList); // Log fetched users
    res.json(userList);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  } finally {
    await leaderBoard.close();
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
