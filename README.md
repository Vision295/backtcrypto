# Backtcrypto - Backend for TCrypto Game

The backend for TCrypto provides APIs to manage cryptocurrencies, events, and the leaderboard. It handles real-time updates for crypto prices and market events.

## Features

- **Cryptocurrency Management**: Fetch and update cryptocurrency data, including price history and volatility.
- **Leaderboard**: Manage player scores and rankings.
- **Market Events**: Simulate random events that affect market conditions.
- **Database Integration**: Uses MongoDB for storing data.
- **RESTful API**: Provides endpoints for frontend interaction.

## Installation

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up the `.env` file with the following variables:
   ```
   ATLAS_URI=<your_mongodb_connection_string>
   ```

## Scripts

### `npm run server`

Starts the backend server on [http://localhost:5000](http://localhost:5000).

Change 'localhost' by your IP address in the server.js file.

## API Endpoints

- **GET /api/users**: Fetch leaderboard data.
- **POST /api/users**: Add or update a user score.
- **GET /api/currencies**: Fetch cryptocurrency data.
- **GET /api/price-history**: Fetch price history for cryptocurrencies.
- **GET /api/events**: Fetch random market events.

## Technologies Used

- **Node.js**: Backend runtime.
- **Express.js**: Web framework.
- **MongoDB**: Database for storing data.
- **dotenv**: Environment variable management.

## Deployment

Ensure the MongoDB connection string is correctly set in the `.env` file before deploying.

## Origin

Based on an old [repository](https://github.com/Vision295/ProjetWEB)