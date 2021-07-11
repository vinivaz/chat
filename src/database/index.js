const mongoose = require('mongoose');
const requireDir = require('require-dir');


//const HOST = process.env.MONGO_HOST;
const HOST = '127.0.0.1'; 
const PORT = process.env.MONGO_PORT;
const DATABASE = process.env.MONGO_DATABASE;

const USER = process.env.MONGO_USER;
const PASSWORD = process.env.MONGO_PASSWORD;

const uri = `mongodb://${USER}:${PASSWORD}@${HOST}:${PORT}/${DATABASE}`;
console.log(uri)

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
}

const connectDB = async () => {
  try{
    const con = await mongoose.connect(uri, options);
  }catch(err) {
    console.log(err);
    process.exit(1); 
  }
  
}

module.exports = connectDB;


/*
try{
  mongoose.connect(uri, options)
  require('../app/models/users.js');
}catch(err){
  console.log(err)
}
  
mongoose.connection.on('error', (err) => {
  console.log(err)
})
*/