const routes = require('express').Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const Users = require('../models/users').model('user');

const authMiddleware = require('../../app/middlewares/auth');

const savePic = require('../middlewares/multer');

//authentication middleware
routes.use(authMiddleware);

routes.get('/find/:userId', async(req, res) => {
  
  try{
  
    const user = await Users.findById(req.params.userId);
    console.log(user);

    return res.json(user)  
  }catch(err){
    console.log(err)
    return res.json({error: "Error on loading profile, Try again"});
  }
  
});

routes.get('/find', async(req, res) => {
  
  try{
  
    const user = await Users.findById(req.userId);
    console.log(user);

    return res.json(user)  
  }catch(err){
    console.log(err)
    return res.json({error: "Error on loading profile, Try again"});
  }
  
});

//post profile picture route
routes.post('/edit', savePic, async(req, res) => {
  console.log("reeqqq",req)
  try{
  
    const user = await Users.findById(req.userId);
    console.log(user);
    const newUserPic = await Users.findByIdAndUpdate(req.userId, {
      
        profile_img: `localhost:3000/files/profile/${req.file.filename}`
      
    }, {new: true});

    //delete picture if user already had an existing profile picture
    if(user.profile_img !== ""){

      //selecting file name from file url
      const oldPic = user.profile_img.slice(29)

      console.log(oldPic);

      try {
        await fs.unlinkSync(path.resolve(__dirname, "..", "..", "..", "tmp", "profile", oldPic));
      
      } catch(err) {
        console.error(err)
        return res.json({error: "Error on uploading a picture, Try again"});
      }
    }

    return res.json(newUserPic)  
  }catch(err){
    console.log(err)
    return res.json({error: "Error on uploading a picture, Try again"});
  }
  
});

routes.post('/remove', async(req, res) => {
  try{
    const user = await Users.findByIdAndUpdate(req.userId, {
      profile_img: ""
    });
    
    //delete picture if user already had an existing profile picture
    if(user.profile_img !== ""){

      //selecting file name from file url
      const oldPic = user.profile_img.slice(29);

      console.log(oldPic);

      try {
        await fs.unlinkSync(path.resolve(__dirname, "..", "..", "..", "tmp", "profile", oldPic));
      
      } catch(err) {
        console.error(err)
        return res.json({error: "Error try again later."});
      }
    }

    user.profile_img = undefined;

    return res.json(user);
  }catch(err){
    console.log(err)
    return res.json({ error: 'Error try again later'});
  }
});

module.exports = routes;
