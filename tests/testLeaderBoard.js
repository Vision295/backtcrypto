const LeaderBoard = require('../leaderBoard'); // Correctly import the Users class

// Example usage
(async () => {
  const leaderBoard = new LeaderBoard();
  await leaderBoard.connect();
  await leaderBoard.addUser("Alice", 100); // Add a user
  await leaderBoard.listUsers(); // List all users
  await leaderBoard.close();
})();