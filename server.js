const express = require('express');
const cors = require('cors'); // Import CORS
const Users = require('./testMangoDB'); // Correctly import the Users class
require('dotenv').config();

if (!process.env.ATLAS_URI) {
  console.error('Error: ATLAS_URI is not defined in the environment variables.');
  process.exit(1); // Exit the application if ATLAS_URI is missing
}

const app = express();
const port = 5000;

app.use(cors()); // Enable CORS

app.get('/api/users', async (req, res) => {
  const users = new Users();
  try {
    await users.connect();
    const database = users.client.db(users.databaseName);
    const usersCollection = database.collection(users.collectionName);
    const userList = await usersCollection.find({}, { projection: { name: 1, score: 1, _id: 0 } }).toArray();
    console.log("Fetched users from database:", userList); // Log fetched users
    res.json(userList);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  } finally {
    await users.close();
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
