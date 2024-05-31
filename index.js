const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const moment = require('moment');
const User = require('./user'); // Ensure this path is correct

const app = express();
const PORT = 3000;


// MongoDB connection
mongoose.connect('mongodb+srv://dk4803382:ironman123@createuser.ockznqh.mongodb.net/?retryWrites=true&w=majority&appName=Createuser')
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

// Listen on the provided PORT or default to 9000
app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
