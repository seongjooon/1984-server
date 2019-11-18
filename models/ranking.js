const mongoose = require('mongoose');

const rankingSchema = new mongoose.Schema({
  nickname: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  score: {
    type: Number,
    unique: true,
    required: true,
    trim: true
  }
});

const User = mongoose.model('Ranking', rankingSchema);
module.exports = User;
