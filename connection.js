const { MongoClient } = require('mongodb');
require('dotenv').config({ path: './config.env' });

async function connectToDatabase() {
  try {
    const Db = process.env.ATLAS_URI;
    if (!Db) {
      throw new Error("ATLAS_URI is not defined in the environment variables.");
    }
    const client = new MongoClient(Db); // Removed deprecated options
    await client.connect(); // Establish the connection
    console.log('Connected to MongoDB');
    return client; // Return the client object
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1); // Exit the application if the connection fails
  }
}

module.exports = connectToDatabase;
