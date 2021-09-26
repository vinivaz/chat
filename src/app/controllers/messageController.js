const routes = require('express').Router();
const fs = require('fs');
const path = require('path');

const Messages = require('../models/messages');

const imgMessage = require('../middlewares/multer');

const authConfig = require('../middlewares/auth');

routes.use(authConfig)

routes.get('/singlemessage/:messageId', async(req, res) => {
  try{
    
    const singleMessage = await Messages.findById(req.params.messageId)
    .populate('userId', ['name','profile_img'],)
    
    return res.json(singleMessage)

  }catch(err){
    console.log(err);
    return res.json({error: 'Error on fetching messages'})
  }
});

routes.get('/lastmessage/:roomId', async(req, res) => {
  try{
    
    const lastMessage = await Messages.find({room: req.params.roomId})
    .sort({$natural:-1})
    .populate('userId', ['name','profile_img'],)
    .limit(1)
    
    return res.json(lastMessage)

  }catch(err){
    console.log(err);
    return res.json({error: 'Error on fetching messages'})
  }
});

routes.get('/:roomId', async(req, res) => {
  const { page = 1 } = req.query;

  /*const pageOptions = {
    page: parseInt(req.query.page, 10) || 0,
    limit: 10
  }*/

  const options = {
    populate:  'userId',
    limit: 15,
    page,
    sort:{ $natural: -1}
  };

  try{
    /*
    const messages = await Messages.find({room: req.params.roomId})
    
    .populate('likes', ['name','profile_img'],)
    .populate('userId', ['name','profile_img'],)
    .limit(pageOptions.limit)
    .skip(pageOptions.page * pageOptions.limit)*/

    const teste = await Messages.paginate({room: req.params.roomId}, options)
    
    return res.json(teste)

  }catch(err){
    console.log(err);
    return res.json({error: 'Error on fetching messages'})
  }
});

routes.post('/', async(req, res) => {

  const { text, respondedTo, room } = req.body;
  console.log(req.userId)
    
  try{

    const messages = await Messages.create({
      text,
      userId: req.userId,
      respondedTo,
      room,
    });

    return res.json({messages})

  }catch(err){
    console.log(err);
    return res.json({error: 'Error on fetching messages'})
  }

});

routes.post('/image', imgMessage, async(req, res) => {

  const { response, room } = req.body;

  console.log(response, room)

  try{

    const messages = await Messages.create({
      url: `localhost:3000/files/message/${req.file.filename}`,
      userId: req.userId,
      response,
      room,
    });

    return res.json({messages})

  }catch(err){
    console.log(err);
    return res.json({error: 'Error on fetching messages'})
  }
});

routes.put('/deleteToOne', async(req, res) => {
  const { messageId } = req.body;
  try{
    const messages = await Messages.findByIdAndUpdate(
      messageId,
      {deletedTo: req.userId},
      {new:true}
    );
    
    return res.json({messages})
    
  }catch(err){
    console.log(err);
    return res.json({error: 'Error on updating message'})
  }
});

routes.put('/', async(req, res) => {
  const { messageId, likes } = req.body;
  try{
    
    for(var i = 0; i < likes.length; i++){ 

      if ( likes[i] === req.userId) { 
        likes.splice(i, 1); 
        console.log(likes)

        const messages = await Messages.findByIdAndUpdate(
          messageId,
          {likes},
          {new:true}
        );
    
        return res.json({messages})
      } 
    }

    const newUserLikes = [...likes, req.userId]
    
    const messages = await Messages.findByIdAndUpdate(
      messageId,
      {likes: newUserLikes},
      {new:true}
    );

    return res.json({messages})
    
  }catch(err){
    console.log(err);
    return res.json({error: 'Error on updating message'})
  }
});

routes.put('/respondedTo', async(req, res) => {
  const { messageId } = req.body;
  try{
    
        const messages = await Messages.findByIdAndUpdate(
          messageId,
          {respondedTo: messageId},
          {new:true}
        );
        return res.json({messages})
    
  }catch(err){
    console.log(err);
    return res.json({error: 'Error on updating message'})
  }
});

routes.delete('/:msgId', async(req, res) => {

  try{
    
    const messages = await Messages.findByIdAndDelete(req.params.msgId);

    if((messages.url) && messages.url !== ""){

      //selecting file name from file url
      const img = messages.url.slice(29);

      console.log(img);

      try {
        await fs.unlinkSync(path.resolve(__dirname, "..", "..", "..", "tmp", "message", img));
      
      } catch(err) {
        console.error(err)
        return res.json({error: "Error try again later."});
      }
    }

    return res.json({response: "Message has been deleted", messages})

  }catch(err){
    console.log(err);
    return res.json({error: 'Error on deleting message'})
  }
});

module.exports = routes;