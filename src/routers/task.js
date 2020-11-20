const express = require('express');
const router = new express.Router();
const auth = require('../middlewares/auth');

const Task = require('../db/models/task');

router.post('/tasks', auth ,async (req, res) => {
  
  const task = new Task({
    ...req.body,
    owner: req.user._id
  });

  try {
    await task.save();
    res.status(201).send(task);
  } catch (e) {
    res.status(400).send(e);
  }

});


//GET all tasks if /tasks
//GET completed tasks if /tasks?completed=true
//GET incompleted tasks if /tasks?completed=false
//GET sortedbytime in ascending if /tasks?sortBy=createdAt_asc
//GET sortedbytime in descending if /tasks?sortBy=createdAt_desc
router.get('/tasks',auth, async(req, res) => {
  try {
    const match = {};
    const sort = {};

    if (req.query.completed) {
      match.completed = req.query.completed === "true";
    }
    
    if (req.query.sortBy) {
      const parts = req.query.sortBy.split('_');
      sort[parts[0]] = parts[1] === asc ? 1 : -1;
    }

    await req.user.populate({
      path: 'tasks',
      match: match,
      options: {
        limit: parseInt(req.query.limit),
        skip:(parseInt(req.query.page)-1)*parseInt(req.query.limit)
      },
      sort
      
    }).execPopulate();
    res.send(req.user.tasks);
  } catch {
    res.status(500).send();
  }
  
});


router.get('/tasks/:id', auth, async (req, res) => {
  const _id = req.params._id;

  try {
    const task=await Task.findOne({_id,owner:req.user._id})
    if (!task) {
      return res.status(404).send();
    }
    res.send(task);
  } catch (e){
    res.status(500).send(e);
  }
});



router.patch('/tasks/:id', auth ,async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['description', 'completed'];
  const isValidOperation = updates.every((update) => {
    return allowedUpdates.includes(update);
  })

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid Updates" });
  }
  try {
    const task = await Task.findOne({ _id: req.params.id, owner: req.user._id });
    //const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).send();
    }
    updates.forEach((update) => {
      task[update] = req.body[update];
    })

    await task.save();
    res.send(task)
  } catch (e) {
    res.status(500).send(e);
  }
});



router.delete('/tasks/:id',auth, async (req, res) => {
  try {
    //const task = await Task.findByIdAndDelete(req.params.id);
    const task = await Task.findOne({ _id: req.params.id, owner: req.user._id });
    if (!task) {
      res.status(404).send();
    }
  res.send(task);
  }
  catch (e) {
    res.status(500).send();
  }
});

module.exports = router;