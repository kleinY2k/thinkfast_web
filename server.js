const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const uri = process.env.MONGODB_URI || "mongodb+srv://quiz_user:Bruh123@thinkfast.27wl7qt.mongodb.net/?retryWrites=true&w=majority&appName=Thinkfast";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let db;

async function connectToMongo() {
    try {
        await client.connect();
        await client.db("admin").command({ ping: 1 });
        console.log("Successfully connected to MongoDB!");

        db = client.db("Thinkfast");

    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
        process.exit(1);
    }
}

connectToMongo().then(() => {

    app.post('/api/scores', async (req, res) => {
      try {
        const { name, score } = req.body;

        if (typeof name !== 'string' || name.trim() === '' || typeof score !== 'number' || score < 0) {
            return res.status(400).json({ message: 'Invalid data: name must be a non-empty string and score must be a non-negative number.' });
        }

        const scoresCollection = db.collection('scores');
        const result = await scoresCollection.insertOne({
            name: name.trim(),
            score: score,
            date: new Date()
        });
        console.log("Score saved:", result.insertedId);
        res.status(201).json({ _id: result.insertedId, name: name.trim(), score: score, date: new Date() });

      } catch (err) {
        console.error("Error saving score:", err);
        res.status(500).json({ message: 'Internal server error while saving score.' });
      }
    });

    app.get('/api/leaderboard', async (req, res) => {
      try {
        const scoresCollection = db.collection('scores');
        const leaderboard = await scoresCollection.find({})
                                                  .sort({ score: -1, date: 1 })
                                                  .limit(10)
                                                  .project({ name: 1, score: 1, date: 1, _id: 0 })
                                                  .toArray();

        console.log("Leaderboard fetched:", leaderboard.length, "entries.");
        res.json(leaderboard);
      } catch (err) {
        console.error("Error fetching leaderboard:", err);
        res.status(500).json({ message: 'Internal server error while fetching leaderboard.' });
      }
    });

    app.listen(port, () => {
      console.log(`Backend server running on port ${port}`);
    });

}).catch(console.error);

process.on('SIGINT', () => {
    client.close().then(() => {
        console.log('MongoDB connection closed due to app termination');
        process.exit(0);
    });
});