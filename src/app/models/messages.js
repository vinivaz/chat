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

module.exports = new mongoose.model('message', messageSchema);