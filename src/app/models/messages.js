const mongoose = require('mongoose');
//const {v4: uuidv4} = require('uuid');
const mongoosePaginate = require('mongoose-paginate');
const fs = require('fs');
const path = require('path');


const messageSchema = new mongoose.Schema({
  text: String,
  url: String,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    require: true,
  },
  deletedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    require: true,
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
  }],
  respondedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'message',
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'room',
    require: true
  }
},{ timestamps: true})

messageSchema.plugin(mongoosePaginate);

messageSchema.pre('remove', async function(next){
  console.log('aaaaaaaaaaaaaaaaaaaaa')
  if((this.url) && this.url !== ""){

    const imgUrl = this.url.slice(29);
    console.log("aparentemente ta funcionando",imgUrl);
    
    try {
      await fs.unlinkSync(path.resolve(__dirname, "..", "..", "..", "tmp", "message", imgUrl));
      next();
    } catch(err) {
      console.error(err)
      next()
    }
  
    next();
  }else{
    next();
  }
  

  
});

messageSchema.pre('delete', async function(next){
  console.log('deleeteeeeeeaaaaaaaaaaaaaaaaaaaaa')
  if((this.url) && this.url !== ""){

    const imgUrl = this.url.slice(29);
    console.log("aparentemente ta funcionando",imgUrl);
    
    try {
      await fs.unlinkSync(path.resolve(__dirname, "..", "..", "..", "tmp", "message", imgUrl));
      next();
    } catch(err) {
      console.error(err)
      next()
    }
  
    next();
  }else{
    next();
  }
  

  
});

messageSchema.pre('deleteOne', async function(next){
  console.log('deleteOOOOneeeaaaaaaaaaaaaaaaaaaaaa')
  
  console.log('1',this[0])
  console.log('2',this[1])
  console.log('3',this.url)
  // if((this.url) && this.url !== ""){

  //   const imgUrl = this.url.slice(29);
  //   console.log("aparentemente ta funcionando",imgUrl);
    
  //   try {
  //     await fs.unlinkSync(path.resolve(__dirname, "..", "..", "..", "tmp", "message", imgUrl));
  //     next();
  //   } catch(err) {
  //     console.error(err)
  //     next()
  //   }
  
  //   next();
  // }else{
  //   next();
  // }
  
  next()
  
});

module.exports = new mongoose.model('message', messageSchema);