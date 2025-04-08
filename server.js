const express = require('express'); // Import Express
const cors = require('cors'); // Import CORS
const { connectToDatabase, closeDatabaseConnection } = require('./connection'); // Import connection functions
const Leaderboard = require('./leaderboard'); // Import the LeaderBoard class
const Currencies = require('./currencies'); // Import the Currencies class

require('dotenv').config({ path: './config.env' });

const app = express(); // Create an Express app
const port = 5000; // Define the port
const ipAddress = 'localhost'; // Change localhost to your desired IP address

app.use(cors()); // Enable CORS
app.use(express.json()); // Add this middleware to parse JSON request bodies

let client; // Declare the client variable
let leaderboard; // Declare the leaderboard variable
let currencies;

// Establish the database connection once when the server starts
(async () => {
  try {
    client = await connectToDatabase(); // Get the client object
    leaderboard = new Leaderboard(client); // Create an instance of the LeaderBoard class with the client
    currencies = new Currencies(client); // Create an instance of the Currencies class with the client
  } catch (error) {
    console.error('Failed to initialize the application:', error);
    process.exit(1); // Exit the application if initialization fails
  }
})();

// Periodically update crypto prices every 10 seconds
setInterval(() => {
  if (currencies) {
    currencies.updateCryptoPrices(); // Call the update method
  }
}, 100); // 10,000 ms = 10 seconds

setInterval(() => {
  if (currencies) {
    currencies.getRandomEvent(); // Call the update method
  }
}, 10000); // 10,000 ms = 10 seconds






app.get('/api/events', async (req, res) => {
  try {
    await currencies;
    await currencies.getRandomEvent(); // Fetch the latest content from the database
    console.log("Sending cached events");
    res.json(currencies.event); // Send the cached events
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Route to send price history
app.get('/api/price-history', async (req, res) => {
  try {
    if (!currencies) {
      return res.status(500).json({ error: 'Currencies instance not initialized' });
    }

    // Appeler updateCryptoPrices pour générer les nouvelles données
    const updatedPrices = await currencies.updateCryptoPrices();
    console.log('Updated prices sent to frontend:', updatedPrices); // Log for debugging
    res.json(updatedPrices); // Envoyer les données générées au frontend
  } catch (error) {
    console.error('Error fetching price history:', error);
    res.status(500).json({ error: 'Failed to fetch price history' });
  }
});

// fetch a new user
app.get('/api/users', async (req, res) => {
  try {
    await leaderboard;
    await leaderboard.getSortedContent(); // Sort the data by score
    console.log('Fetched users');  // Log the fetched data for debugging
    res.json(leaderboard.content); // Send the fetched data as a JSON response
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// enter a new user !
app.post('/api/users', async (req, res) => {
  const { name, score } = req.body;
  if (!name || typeof score !== "number") {
    return res.status(400).json({ error: "Invalid data" });
  }

  try {
    await leaderboard;
    await leaderboard.addUser(name, score); // Add the user to the leaderboard
    console.log(`User ${name} updated with score: ${score}`); // Log the added user for debugging
    res.json({ success: true }); // Send a success response
  } catch (error) {
    console.error("Error adding user:", error);
    res.status(500).json({ error: "Failed to add user" }); // Send an error response
  }
});

// Start the server
app.listen(port, ipAddress, () => {
  console.log(`Server is running on http://${ipAddress}:${port}`);
});

// Gracefully close the database connection on server shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down server...');
  await closeDatabaseConnection(client); // Close the MongoDB connection
  process.exit(0); // Exit the process
});