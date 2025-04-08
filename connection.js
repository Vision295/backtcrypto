const { MongoClient } = require('mongodb');
require('dotenv').config({ path: './config.env' });


async function connectToDatabase() {
  try {
    const Db = process.env.ATLAS_URI;
    if (!Db) {
      throw new Error("ATLAS_URI is not defined in the environment variables.");
    }
    const client = new MongoClient(Db); // Initialize the client
    await client.connect(); // Establish the connection
    console.log('Connected to MongoDB');
    return client; // Return the client object
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1); // Exit the application if the connection fails
  }
}

async function closeDatabaseConnection(client) {
  try {
    if (client) {
      await client.close(); // Close the connection
      console.log('MongoDB connection closed');
    }
  } catch (error) {
    console.error('Failed to close MongoDB connection:', error);
  }
}

module.exports = { connectToDatabase, closeDatabaseConnection };
