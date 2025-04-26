const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb'); // Import ObjectId if you need to query by ID
require('dotenv').config(); // Optional: for using environment variables

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection URI (Replace with your Atlas connection string or use .env)
const uri = process.env.MONGODB_URI || "mongodb+srv://quiz_user:Bruh123@thinkfast.27wl7qt.mongodb.net/?retryWrites=true&w=majority&appName=Thinkfast"; // Your connection string here

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let db; // Variable to hold the database connection

async function connectToMongo() {
    try {
        await client.connect();
        // Ping to confirm successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Successfully connected to MongoDB!");

        // --- Get a reference to your database ---
        db = client.db("Thinkfast"); // Replace "Thinkfast" with your database name from the connection string or Atlas

    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
        process.exit(1); // Exit the process if the database connection fails
    }
}

// Connect to MongoDB before starting the server
connectToMongo().then(() => {
    // --- API Endpoints ---

    // Endpoint to submit a score
    app.post('/api/scores', async (req, res) => {
      try {
        const { name, score } = req.body;

        if (typeof name !== 'string' || name.trim() === '' || typeof score !== 'number' || score < 0) {
            return res.status(400).json({ message: 'Invalid data: name must be a non-empty string and score must be a non-negative number.' });
        }

        const scoresCollection = db.collection('scores'); // Get the scores collection
        const result = await scoresCollection.insertOne({
            name: name.trim(),
            score: score,
            date: new Date()
        });
        console.log("Score saved:", result.insertedId); // Log the inserted document ID
        res.status(201).json({ _id: result.insertedId, name: name.trim(), score: score, date: new Date() }); // Send back the saved score details

      } catch (err) {
        console.error("Error saving score:", err);
        res.status(500).json({ message: 'Internal server error while saving score.' });
      }
    });

    // Endpoint to get leaderboard (top 10)
    app.get('/api/leaderboard', async (req, res) => {
      try {
        const scoresCollection = db.collection('scores'); // Get the scores collection
        const leaderboard = await scoresCollection.find({})
                                                  .sort({ score: -1, date: 1 }) // Sort by score descending, then date ascending
                                                  .limit(10) // Get top 10
                                                  // Project to select specific fields (optional, but good practice)
                                                  .project({ name: 1, score: 1, date: 1, _id: 0 }) // Exclude _id, include others
                                                  .toArray(); // Convert cursor to array

        console.log("Leaderboard fetched:", leaderboard.length, "entries."); // Log fetched entries count
        res.json(leaderboard);
      } catch (err) {
        console.error("Error fetching leaderboard:", err);
        res.status(500).json({ message: 'Internal server error while fetching leaderboard.' });
      }
    });

    // Start the server *after* successfully connecting to the database
    app.listen(port, () => {
      console.log(`Backend server running on port ${port}`);
    });

}).catch(console.error); // Catch any errors during the connection process

// Optional: Close the MongoDB connection when the Node.js process exits
process.on('SIGINT', () => {
    client.close().then(() => {
        console.log('MongoDB connection closed due to app termination');
        process.exit(0);
    });
});