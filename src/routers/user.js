const express = require('express');
const router = new express.Router();

const User = require('../db/models/user');

router.post('/users', async (req, res) => {
  
  const user = new User(req.body);

  try {
    await user.save();
    res.status(201).send(user);
  } catch (e){
    res.status(400).send(e);
  }
  
});

router.post('/users/login', async (req, res) => {
  try {
    const user = await User.findByCredentials(req.body.email, req.body.password);
    res.send(user);
  } catch (e) {
    res.status(400).send();
  };
});

router.get('/users', async (req, res) => {
  
  try {
    const users = await User.find({});
    res.send(users);
  } catch (e) {
    res.status(500).send();
  }
});

router.get('/users/:id', async(req, res) => {
  
  try {
    const user = await User.findById({ _id: req.params.id });
    if (!user) {
      return res.status(404).send();
    }
    res.send(user);
  } catch (e) {
    res.status(500).send(e);
  }
});

router.patch('/users/:id', async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'password', 'email', 'age'];
  const isValidOperation = updates.every(update => {
    return allowedUpdates.includes(update);
  });
  if (!isValidOperation) {
    return res.status(500).send();
  }
  try {
    const user = await User.findById(req.params.id);
    updates.forEach((update) => {
      user[update] = req.body[update];
    });
    await user.save();
    if (!user) {
      return res.status(404).send();
    }
    res.send(user);
  } catch (e) {
    res.status(400).send();
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).send();
    }
    res.send(user);
  } catch (e){
    res.status(500).send();
  }
});

module.exports = router;