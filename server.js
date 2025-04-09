const express = require('express');
const cors = require('cors');
const { connectToDatabase, closeDatabaseConnection } = require('./connection');
const Leaderboard = require('./leaderboard');
const Currencies = require('./currencies');

require('dotenv').config({ path: './config.env' });

const app = express();
const port = 5000;
const ipAddress = 'localhost';

app.use(cors());
app.use(express.json());

let client;
let leaderboard;
let currencies;

(async () => {
  try {
    client = await connectToDatabase();
    leaderboard = new Leaderboard(client);
    currencies = new Currencies(client);
  } catch (error) {
    console.error('Failed to initialize the application:', error);
    process.exit(1);
  }
})();

setInterval(() => {
  if (currencies) {
    currencies.updateCryptoPrices(); // Call the update method
  }
}, 5100); // 5000 ms = 5 seconds

setInterval(async () => {
  if (currencies) {
    const event = await currencies.getRandomEvent();
    if (event) {
      await currencies.applyEventVolatility(event);
    }
  }
}, 30000); // 30 s

const apiEndpoints = [
  {
    path: '/api/events',
    handler: async () => {
      await currencies.getRandomEvent();
      return currencies.event;
    },
  },
  {
    path: '/api/crypto-prices',
    handler: async () => {
      await currencies.getContent();
      return currencies.content;
    },
  },
  {
    path: '/api/currencies',
    handler: async () => {
      await currencies.getContent();
      return currencies.content;
    },
  },
  {
    path: '/api/users',
    handler: async () => {
      await leaderboard.getSortedContent();
      return leaderboard.content;
    },
  },
  {
    path: '/api/price-history',
    handler: async () => {
      const updatedPrices = await currencies.updateCryptoPrices();
      return updatedPrices;
    },
  }, 
  {
    path: '/api/current-event',
    handler: async () => {
      const currentEvent = await currencies.getRandomEvent();
      return currentEvent;
    }
  }
];

apiEndpoints.forEach(({ path, handler }) => {
  app.get(path, async (req, res) => {
    try {
      const data = await handler();
      console.log(`Sending cached data for ${path}`);
      res.json(data);
    } catch (error) {
      console.error(`Error fetching data for ${path}:`, error);
      res.status(500).json({ error: `Failed to fetch data for ${path}` });
    }
  });
});

app.post('/api/users', async (req, res) => {
  const { name, score } = req.body;
  if (!name || typeof score !== 'number') {
    return res.status(400).json({ error: 'Invalid data' });
  }

  try {
    await leaderboard.addUser(name, score);
    console.log(`User ${name} updated with score: ${score}`);
    res.json({ success: true });
  } catch (error) {
    console.error('Error adding user:', error);
    res.status(500).json({ error: 'Failed to add user' });
  }
});

app.listen(port, ipAddress, () => {
  console.log(`Server is running on http://${ipAddress}:${port}`);
});

process.on('SIGINT', async () => {
  console.log('Shutting down server...');
  await closeDatabaseConnection(client);
  process.exit(0);
});
