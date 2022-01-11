const bcrypt = require('bcrypt');
const routes = require('express').Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');


const mailer = require('../../modules/mailer');

const Users = require('../models/users').model('user');
const Messages = require('../models/messages');
const Rooms = require('../models/rooms');

const authMiddleware = require('../../app/middlewares/auth');

const savePic = require('../middlewares/multer');





//authentication middleware
routes.use(authMiddleware);

routes.get('/find/:userId', async(req, res) => {
  
  try{
  
    const user = await Users.findById(req.params.userId);
    //console.log(user);

    return res.json(user)  
  }catch(err){
    //console.log(err)
    return res.json({error: "Error on loading profile, Try again"});
  }
  
});

routes.get('/find', async(req, res) => {
  
  try{
  
    const user = await Users.findById(req.userId);
    //console.log(user);

    return res.json(user)  
  }catch(err){
    //console.log(err)
    return res.json({error: "Error on loading profile, Try again"});
  }
  
});

//post profile picture route
routes.post('/edit', savePic, async(req, res) => {
  
  try{
  
    const user = await Users.findById(req.userId);
    //console.log(user);
    const newUserPic = await Users.findByIdAndUpdate(req.userId, {

      // profile_img: `localhost:3000/files/profile/${req.file.filename}`
        profile_img: `https://nexum-api.herokuapp.com/files/profile/${req.file.filename}`
      
    }, {new: true});

    //delete picture if user already had an existing profile picture
    if(user.profile_img !== ""){

      //selecting file name from file url
      const oldPic = user.profile_img.slice(29)

      try {
        await fs.unlinkSync(path.resolve(__dirname, "..", "..", "..", "tmp", "profile", oldPic));
      
      } catch(err) {
        //console.error(err)

        return res.json(newUserPic)
        // return res.json({error: "Error on uploading a picture, Try again"});
      }
    }

    return res.json(newUserPic)  
  }catch(err){
    console.log(err)
    return res.json({error: "Error on uploading a picture, Try again"});
  }
  
});

routes.post('/changePasswordLoggedIn', async(req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  try {
    
    const user = await Users.findById(req.userId).select('+password');

    if(!user){
      return res.json({ error: "User not found" });
    }

    if(!await bcrypt.compare(currentPassword, user.password)) {
      return res.json({ error: 'Invalid password' });
    };

    user.password = newPassword;

    await user.save();

    return res.json();
     
  }catch(err){
    console.log(err);
    return res.json({ error: 'Error on changing password' });
  }
});

routes.post('/sendEmailToken', async(req, res) => {
  
  try {
    
    const user = await Users.findById(req.userId)

    if(!user){
      return res.json({ error: "User not found" });
    }

    const token = crypto.randomBytes(20).toString('hex');

      const now = new Date();
      now.setHours(now.getHours() + 1);

      await Users.findByIdAndUpdate(user.id,{
        '$set': {
          passwordResetToken: token,
          passwordResetExpires: now
        }
      });

      await mailer.sendMail(
        {
          to: user.email,
          from: 'alguem',
          template: 'auth/forgot_password',
          context: { token }
        },(err) => {
          if (err){
            console.log(err)
            return res.status(400)
            .send({ error: 'Cannot send forgot password email' });
          }else{         
            return res.send();
          }
        }
      );
     
  }catch(err){
    console.log(err);
    return res.json({ error: 'Error on changing password' });
  }
});

routes.post('/changeEmailLoggedIn', async(req, res) => {
  const { token, email } = req.body;

  try {

    if(email === ""){
      return res.json({ error: 'New new E-mail Address required'});
    }

    if(await Users.findOne({email})){
      return res.json({error: 'Email already exists'})
    }

    if(token === ""){
      return res.json({ error: 'Token required'});
    }

    const user = await Users.findById(req.userId).select('+ passwordResetToken passwordResetExpires');

    if(token !== user.passwordResetToken) {
      return res.json({ error: 'Invalid token' });
    }

    const now = new Date();

    console.log(now)
    if(now > user.passwordResetExpires){
      return res.json({ error: 'Token has expired'});
    }

    await Users.findByIdAndUpdate(req.userId,{
      '$set': {
        email
      }
    })

    return res.json();

  }catch(err){
    console.log(err)
  }
})

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


routes.post('/deleteAccount', async(req, res) => {
  const { password } = req.body;
  try{ 
    const user = await Users.findById(req.userId).select('+ password profile_img')
   
    if(!await bcrypt.compare(password, user.password)) {
      return res.json({ error: 'Invalid password' });
    };

    const allRooms = await Rooms.find({users: req.userId})
    //console.log("allrUserRooms", allRooms)

    const roomsIds = allRooms.map(room => room._id)
    //console.log("rromsIds",roomsIds)

    for(var i = 0; i < roomsIds.length; i++){
      
      const allMessages = await Messages.find({room: roomsIds[i]})
      //await Messages.deleteMany({room: roomIds[i]})
      //console.log(allMessages)

      allMessages.map(msg =>{
        if((msg.url)&& msg.url !== ''){
          try {
            const imgUrl = msg.url.slice(29);
            //console.log(imgUrl)

            fs.unlinkSync(path.resolve(__dirname, "..", "..", "..", "tmp", "message", imgUrl));
            //console.log('supostametne vai apagar')
          } catch(err) {
            console.error(err)
            
          }

        }  
      })

      await Messages.deleteMany({room: roomsIds[i]})


    }

    await Rooms.deleteMany({users: req.userId})



    // if(user.profile_img !== ""){

    //   //selecting file name from file url
    //   const oldPic = user.profile_img.slice(29);

    //   console.log(oldPic);

    //   try {
    //     await fs.unlinkSync(path.resolve(__dirname, "..", "..", "..", "tmp", "profile", oldPic));
      
    //   } catch(err) {
    //     console.error(err)
    //     return res.json({error: "Error try again later."});
    //   }
    // }
    
    // const rooms = await Rooms.find({ users: req.userId});
    // const roomIds = rooms.map(room => {
    //   await Messages.deleteMany({room: room._id})
      
    // })

    // for(var i = 0; i < roomIds.length; i++){
      
      
    //   await Messages.deleteMany({room: roomIds[i]})
    // }

    // await Rooms.remove({users: req.userId})

    // await user.delete()

    await user.delete()
 
    return res.json(allRooms)
  }catch(err){
    console.log(err)
  }

  //const room = await Rooms.findByIdAndDelete(req.params.roomId);  
  //const messages = await Messages.remove({room: req.params.roomId});

})

module.exports = routes;
