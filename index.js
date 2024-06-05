const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const User = require('./user')

const app = express();
const server = http.createServer(app);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

mongoose.connect('mongodb+srv://dk4803382:ironman123@createuser.ockznqh.mongodb.net/?retryWrites=true&w=majority&appName=Createuser', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(error => console.error('Connection error:', error));

app.use(express.static(path.join(__dirname, 'public')));

// API endpoint to create a new user
app.post('/api/users', async (req, res) => {
  try {
    console.log('Received data:', req.body);
    const newUser = new User(req.body);
    await newUser.save();
    console.log('User saved successfully:', newUser);
    io.to('live_users').emit('userJoined', { email: newUser.email, socketId: newUser._id.toString() });
    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error saving user:', error);
    res.status(400).json({ message: error.message });
  }
});

// API endpoint to get user by email
app.get('/api/users/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: error.message });
  }
});

// API endpoint to get all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users); 
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: error.message });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const io = require('socket.io')(server);

let users = [];

io.on('connection', (socket) => {
  socket.on('join_live_users', ({ email }) => {
    if (!users.find(user => user.email === email)) {
      const user = { email, socketId: socket.id };
      users.push(user);
      io.emit('userJoined', { email, socketId: socket.id, allUsers: users });
    } else {
      socket.emit('userJoined', { email, socketId: socket.id, allUsers: users });
    }
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
