const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const moment = require('moment');
const User = require('./user'); // Ensure this path is correct

const app = express();
const PORT = process.env.PORT || 3001; // Change the port to 3001 or any other port

// MongoDB connection
mongoose.connect('mongodb+srv://dk4803382:xpU7dzbTGTEBUIIK@taskproject.ulz6n1e.mongodb.net/taskproject?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(error => console.error('Connection error:', error));

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.post('/api/users', async (req, res) => {
  try {
    const newUser = new User(req.body);
    await newUser.save();
    res.status(200).json(newUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Catch-all route handler for serving 'index.html'
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://127.0.0.1:${PORT}`);
});
