const mongoose = require('mongoose');

const onlineSchema = new mongoose.Schema({
  online: [{
    type: String
  }]
  /*online: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  }]*/
})

module.exports = new mongoose.model('online', onlineSchema);