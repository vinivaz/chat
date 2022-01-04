const mongoose = require('mongoose');
const {v4: uuidv4} = require('uuid');
const mongoosePaginate = require('mongoose-paginate');

const roomSchema = new mongoose.Schema({
  
  adm: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    require: true,
  }],
  accepted: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
  }],
  lastMessage: {
    type: String,
  },
  users: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
  }],
  name: {
    type: String,
    require: false,
  },
},{ timestamps: true});

roomSchema.plugin(mongoosePaginate);


module.exports = new mongoose.model('room', roomSchema);