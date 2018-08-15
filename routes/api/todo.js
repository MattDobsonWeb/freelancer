const express = require('express');
const router = express.Router();
const passport = require('passport');
const keys = require('../../config/keys');

// Load Models
const Task = require('../../models/Tasks');
const User = require('../../models/User');

// @route   GET api/posts/test
// @desc    Tests post route
// @access  Public
router.get('/test', (req, res) => res.json({ msg: 'Todo Works' }));

// @route   POST api/todo/create
// @desc    Create a task!
// @access  Public
router.post(
  '/create',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const newTask = new Task({
      user: req.user.id,
      text: req.body.text,
      completed: false
    });

    newTask.save().then(task => res.json(task));
  }
);

// @route   GET api/todo
// @desc    Get users tasks
// @access  Public
router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Task.find({ user: req.user.id })
      .populate('user', ['username', 'avatar'])
      .sort({ date: -1 })
      .then(tasks => {
        res.json(tasks);
      })
      .catch(() => res.status(404).json({ notasksfound: 'No tasks found' }));
  }
);

// @route   UPDATE api/todo/complete/:id
// @desc    Mark a task as complete
// @access  Public
router.put(
  '/complete/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { completed: true },
      { new: true }
    )
      .then(task => {
        if (!task) return res.json({ notaskfound: 'No task found' });

        return res.json(task);
      })
      .catch(err => res.json(404).json({ notaskfound: 'No task found' }));
  }
);

// @route   UPDATE api/todo/incomplete/:id
// @desc    Mark a task as incomplete
// @access  Public
router.put(
  '/incomplete/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Task.findByIdAndUpdate(
      req.params.id,
      { completed: false },
      { new: true }
    ).then(task => res.json(task));
  }
);

module.exports = router;
