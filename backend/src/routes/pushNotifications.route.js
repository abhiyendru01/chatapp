import express from 'express';

const router = express.Router();

// Store the subscriptions (in memory for now, but ideally you should save them to a database)
let subscriptions = [];

// Save subscription
router.post('/save-subscription', (req, res) => {
  const subscription = req.body;  // The subscription object received from the frontend
  subscriptions.push(subscription);  // Save it in memory (you can use a database in production)
  res.status(200).send('Subscription saved!');
});

export default router;
