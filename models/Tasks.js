const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create user schema
const TaskSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'users'
  },
  text: {
    type: String,
    required: true
  },
  completed: {
    type: Boolean
  },
  date: {
    type: Date,
    default: Date.now
  }
});

// Export model
module.exports = User = mongoose.model('tasks', TaskSchema);
