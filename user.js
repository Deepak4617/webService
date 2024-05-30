const mongoose = require('mongoose');
const moment = require('moment');

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  mobileNo: String,
  email: String,
  address: {
    street: String,
    city: String,
    state: String,
    country: String
  },
  loginId: String,
  password: String,
  createdAt: { type: String, default: moment().format('DD-MMM-YYYY') },
  updatedAt: { type: String, default: moment().format('DD-MMM-YYYY') }
});

// Middleware to update the updatedAt field
userSchema.pre('save', function(next) {
  this.updatedAt = moment().format('DD-MMM-YYYY');
  if (!this.createdAt) {
    this.createdAt = moment().format('DD-MMM-YYYY');
  }
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
