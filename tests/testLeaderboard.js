const Leaderboard = require('../leaderboard'); // Correctly import the Users class

// Example usage
(async () => {
  const leaderboard = new Leaderboard();
  await leaderboard.connect();
  await leaderboard.addUser("Alice", 100); // Add a user
  await leaderboard.listUsers(); // List all users
  await leaderboard.close();
})();