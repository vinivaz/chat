const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const mailer = require('../../modules/mailer');

const authConfig = require('../../config/auth.json');

const Users = require('../models/users').model('user');
//const Users = models.model('user');

function generateToken (params = {}) {
  return jwt.sign(params, authConfig.secret, {
    expiresIn: 86400,//86400
  });

}

module.exports = {
  

  async list(req, res) {

    const { page = 1 } = req.query;
    const options = {
      page: page,
      limit: 15
    }

    const user = await Users.paginate({}, options);

    return res.json(user);
  },

  async register(req, res) {
    const { name, email, password } = req.body;

    try{

      if(await Users.findOne({email})){
        return res.json({error: 'Email already exists'})
      }

      if(await Users.findOne({name})){
        return res.json({error: 'Name already exists'})
      }

      if(!password) return res.json({ error: 'Insert password' });

      //const hash = await bcrypt.hash(password, 10);

      const user = await Users.create({
        name,
        password,
        email,
        profile_img: "",
      });

      user.password = undefined;
  
      return res.json({
        user,
        token: generateToken({ id: user.id})
      });

    }catch(err){
      return res.json({error: 'Couldn\'t Register, try again'})
    }
  },

  async auth(req, res) {
    const { email, password } = req.body;

    try{
      
      const user = await Users.findOne({email}).select('+password');

      if(!user) {
        return res.json({error: 'User not Found'})
      };

      if(!await bcrypt.compare(password, user.password)) {
        return res.json({ error: 'Invalid password' });
      };

      user.password = undefined;

      return res.json({
        user,
        token: generateToken({ id: user.id})
      });
    }catch(err){

      return res.json({ error: 'Error on Signing' });
    }

  },

  async forgotPassword(req, res) {
    const { email } = req.body;
    
    try {
      
      const user = await Users.findOne({ email });

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

      //console.log("token ", token)

      await mailer.sendMail(
        {
          to: email,
          from: 'alguem',
          template: 'auth/forgot_password',
          context: { token }
        },(err) => {
          if (err){
            console.log(err)
            return res
            .send({ error: 'Cannot send forgot password email' });
          }else{         
            return res.send();
          }
        }
      );
       
    }catch(err){
      console.log(err);
      return res.json({ error: 'Error on forgot password' });
    }
    
  },

  async changePassword(req, res) {
    const { email, password, token } = req.body;

    try{
      const user = await Users.findOne({ email }).select('+ passwordResetToken passwordResetExpires')
      
      if(!user){
        return res.json({ error: 'User not found'});
      }

      if(password === ""){
        return res.json({ error: 'New password required'});
      }

      if(token !== user.passwordResetToken) {
        return res.json({ error: 'Invalid token' });
      }

      const now = new Date();

      console.log(now)
      if(now > user.passwordResetExpires){
        return res.json({ error: 'Token has expired'});
      }

      user.password = password;

      await user.save();

      return res.json({result: "Password changed successfully"});

    }catch(err){
      console.log(err)
      return res.json({ error: 'Error changing your password, try again later'});
    }
  },

  async delete(req, res) {
    const { email, password } = req.body;

    try{
      
      const user = await Users.findOne({email}).select('+password');
      
      
      if(!user) {
        return res.json({error: 'User not Found'})
      };

      if(!await bcrypt.compare(password, user.password)) {
        return res.json({ error: 'Invalid password' });
      };

      await user.delete()

      return res.json();

    }catch(err){
      console.log(err)
      return res.json({ error: 'Error on deleting account' });
    }

  }

}

/*
    async patch(req, res) {
    const user = req.body.newUser;
    const [ name, email ] = user;

    try{
      await Users.findOne({email})
      if(){
        return res.json({error: 'Email already exists'})

      }else {

        if(await Users.findOne({name})){

          return res.json({error: 'Name already exists'})
          
        }else{
          
          if(user.password !== "") {
            const hash = await bcrypt.hash(password, 10);
          }
        }
      }
      const user = await Users.create({
        name,
        password: hash,
        email
      });

      user.password = undefined;
  
      return res.json({
        user,
        token: generateToken({ id: user.id})
      });

    }catch(err){
      return res.json({error: 'Couldn\'t Register, try again'})
    }
  },
  */