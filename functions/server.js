// Required for Firebase Functions
const admin = require("firebase-admin");
const serviceAccount = require("./serviceKey.json");
const functions = require('firebase-functions');

// Set up Express server
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// Initialize Express
const app = express();
app.use(cors({ origin: true }));
app.use(bodyParser.json());

// Connect to MongoDB
const connectMongoDB = require('./database/database');
connectMongoDB();

// Import MongoDB functions
const addData = require('./database/addData');
const searchData = require('./database/searchData');
const deleteData = require('./database/deleteData');
const updateData = require('./database/updateData');

app.post('/addSearchData', async (req, res) => {
  try {
    const data = await addData(req.body);
    res.status(201).send(data);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.get('/search', async (req, res) => {
  const { query } = req.query;
  try {
    const results = await searchData(query);
    res.json(results);
  } catch (error) {
    console.error('Search Error:', error);
    res.status(500).json({ error: 'Error performing search' });
  }
});

app.delete('/delete', async (req, res) => {
  const { title } = req.query;
  try {
    const data = await deleteData(title);
    res.json(data);
  } catch (error) {
    console.error('Delete Error:', error);
    res.status(500).json({ error: 'Error deleting data' });
  }
});

app.put('/update', async (req, res) => {
  const { title, description } = req.body;
  try {
    const updatedData = await updateData(title, description);
    if(updatedData) {
      res.json(updatedData);
    } else {
      res.status(404).send('No document found with that title');
    }
  } catch (error) {
    console.error('Update Error:', error);
    res.status(500).json({ error: 'Error updating data' });
  }
});

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://phat-black-default-rtdb.firebaseio.com",
});

// Import Cloud Functions
const deleteUser = require("./cloudFunctions/deleteUser");
const subscriptionPayment = require("./cloudFunctions/subscriptionPayment");
const cancelSubscription = require("./cloudFunctions/cancelSubscription");

// Export Cloud Functions
exports.deleteUser = deleteUser;
exports.subscriptionPayment = subscriptionPayment;
exports.cancelSubscription = cancelSubscription;

// Export the Express API as a Cloud Function
exports.api = functions.https.onRequest(app);