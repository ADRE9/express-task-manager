const express = require('express');
const auth = require('../middlewares/auth');
const multer = require('multer');
const router = new express.Router();


const User = require('../db/models/user');

router.post('/users' ,async (req, res) => {
  
  const user = new User(req.body);

  try {
    await user.save();
    await user.generateAuthToken();
    res.status(201).send(user);
  } catch (e){
    res.status(400).send(e);
  }
  
});

router.post('/users/login',async (req, res) => {
  try {
    const user = await User.findByCredentials(req.body.email, req.body.password);
    const token = await user.generateAuthToken();
    res.send({user,token});
  } catch (e) {
    res.status(400).send();
  };
});

router.post('/users/logout', auth, async(req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(token => {
      return token.token !== req.token;
    });
    await req.user.save();

    res.send();
  } catch (e) {
    res.status(500).send();
  }
})

router.post('/users/logoutAll', auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();

    res.send();
  } catch (e){
    res.status(500).send();
  }
})

router.get('/users/me',auth ,async (req, res) => {
  
  res.send(req.user);
});


router.patch('/users/me', auth ,async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'password', 'email', 'age'];
  const isValidOperation = updates.every(update => {
    return allowedUpdates.includes(update);
  });
  if (!isValidOperation) {
    return res.status(500).send();
  }
  try {
    updates.forEach((update) => {
      req.user[update] = req.body[update];
    });
    await req.user.save();
    res.send(req.user);
  } catch (e) {
    res.status(400).send();
  }
});

router.delete('/users/me', auth ,async (req, res) => {
  try {
    await req.user.remove();
    res.send(req.user);
  } catch (e){
    res.status(500).send();
  }
});

//multer options object
const upload = multer({
  limits: {
    fileSize:10000000
  },
  fileFilter(req, file, cb) {
    
    if (!file.originalname.match(/\.(png||jpg||jpeg||webp)$/)) {
      return cb(new Error('File is not an image'));
    }
    cb(undefined, true);
    //cb(undefined,true)=> for succesful file Upload
    //cb(undefined,false)=>for unseccessful file upload
    //cb(new Error('File is not a PDF etc etc'))=> for the error
  },
});

router.post('/user/me/avatar', auth, upload.single('avatar'), async (req, res) => {
  const buffer = await sharp(req.file.buffer).resize({width:250,height:250}).png().toBuffer();
  req.user.avatar = buffer;
  await req.user.save();
  res.status(200).send();
}, (error,req,res,next) => {
    res.status(400).send({error:error.message})
});

router.get('/user/:id/avatar', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user || !user.avatar) {
      throw new Error();
    }
    res.set('Content-type', 'image/png');
    res.status(200).send(user.avatar);
  } catch {
    res.status(400).send();
  }
})

router.delete('/user/me/avatar', auth, async (req, res) => {
  try{
    req.user.avatar = undefined;
    await req.user.save();
    res.status(200).send({message:"Avatar deleted successfullly"})
  } catch (e) {
    res.status(400).send({ error: "Unable to delete the avatar" });
  }
})

module.exports = router;