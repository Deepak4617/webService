const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const User = require('./user')

// User model schema
// const userSchema = new mongoose.Schema({
//   firstName: String,
//   lastName: String,
//   mobileNo: String,
//   email: String,
//   address: {
//     street: String,
//     city: String,
//     state: String,
//     country: String,
//   },
//   loginId: String,
//   password: String,
// });

// const User = mongoose.model('User', userSchema);

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Replace with your MongoDB connection string
mongoose.connect('mongodb+srv://dk4803382:ironman123@createuser.ockznqh.mongodb.net/?retryWrites=true&w=majority&appName=Createuser', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(error => console.error('Connection error:', error));

// Serve static files from the 'public' directory
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

// Endpoint to delete a user
app.delete('/api/users/:email', async (req, res) => {
  try {
    const user = await User.findOneAndDelete({ email: req.params.email });
    if (user) {
      io.to('live_users').emit('userRemoved', { email: user.email, socketId: user._id.toString() });
      res.status(200).json({ message: 'User deleted successfully' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


io.on('connection', (socket) => {
  socket.on('join_live_users', async (data) => {
    const { email } = data;
    socket.join('live_users');

    try {
      const users = await User.find({}, 'email _id');
      const userData = users.map(user => ({ email: user.email, socketId: socket.id }));
      socket.emit('current_users', userData);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
    
    io.to('live_users').emit('userJoined', { email, socketId: socket.id });
  });

  socket.on('disconnect', () => {
    io.to('live_users').emit('userDisconnected', socket.id);
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
