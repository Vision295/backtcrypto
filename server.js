const express = require('express'); // Import Express
const cors = require('cors'); // Import CORS
const connectToDatabase = require('./connection'); // Import the connection function
const LeaderBoard = require('./leaderboard'); // Import the LeaderBoard class
require('dotenv').config({ path: './config.env' });
const { MongoClient } = require('mongodb');

const app = express(); // Create an Express app
const port = 5000; // Define the port

app.use(cors()); // Enable CORS
app.use(express.json()); // Add this middleware to parse JSON request bodies

let client; // Declare the client variable
let leaderboard; // Declare the leaderboard variable

// Establish the database connection once when the server starts
(async () => {
  try {
    client = await connectToDatabase(); // Get the client object
    leaderboard = new LeaderBoard(client); // Create an instance of the LeaderBoard class with the client
  } catch (error) {
    console.error('Failed to initialize the application:', error);
    process.exit(1); // Exit the application if initialization fails
  }
})();

// Basic route to test the connection
app.get('/', (req, res) => {
  res.send('Server is running and connected to the frontend!');
});

// Route to fetch users from the database
app.get('/api/users', async (req, res) => {
  try {
    await leaderboard.getContent(); // Fetch the data from the database
    console.log('Fetched users'); // Log the fetched data for debugging
    res.json(leaderboard.content); // Send the fetched data as a JSON response
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});