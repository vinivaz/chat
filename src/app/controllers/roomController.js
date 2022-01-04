const routes = require('express').Router();
const fs = require('fs');
const path = require('path');

const Rooms = require('../models/rooms');
const Messages = require('../models/messages');
const authConfig = require('../middlewares/auth');


routes.use(authConfig);

routes.get('/', async(req, res) => {
  const { page = 1 } = req.query;
  const options = {
    page: page,
    limit: 15,
    sort:{ updatedAt: -1},
    populate: ['users']
  }

  try{
    
    const room = await Rooms.paginate({ users: req.userId}, options);  
    return res.json({room})
  }catch(err){
    //console.log(err)
    return res.json({error: 'error on find rooms'});
  }
});

routes.get('/:roomId', async(req, res) => {
  const { roomId } = req.params;

  try{
    
    const room = await Rooms.findById(roomId);  
    return res.json({room})
  }catch(err){
    console.log(err)
    return res.json({error: 'error on find room'});
  }
});

routes.post('/byUsers', async(req, res) => {
  const { id1, id2 } = req.body;
  //const userId = req.userId;
  //console.log("reqbody", req.body)

  try{
    
    const room = await Rooms.find({ users: [id1, id2] });  
    return res.json({room})
  }catch(err){
    console.log(err)
    return res.json({error: 'error on find room'});
  }
});

routes.post('/', async(req, res) => {
  const { usersReceiver, name } = req.body;
  const users = [...usersReceiver, req.userId]
  
  try{

    const room = await Rooms.create({
      adm: [req.userId],
      users,
      name,
      lastMessage: ''
    })
    return res.json({room})
  }catch(err){
    console.log(err)
    return res.json({error: 'Error on creating a room'})
  }
});

routes.put('/:roomId', async(req, res) => {
  
  
  const {adm, accepted, users} = req.body;

  if(!adm)return res.json({error: 'No adm info providen'});

  if(!accepted) return res.json({error: 'No accepted info providen'});
  
  if(!users) return res.json({error: 'No users info providen'});
  
  try{
    const room = await Rooms.findByIdAndUpdate(req.params.roomId,{
      "$set": {
        adm, accepted, users
      }
    }, {new: true});
    return res.json({room, deuBom: 'nenhum era pra ta null'})

  }catch(err){
    console.log(err)
    return res.json({error: 'Error on on updating a room'})
  }
});

routes.delete('/:roomId', async(req, res) => {
  try{
    const room = await Rooms.findByIdAndDelete(req.params.roomId); 
    
    const messages = await Messages.find({room: req.params.roomId})

    //const messagesId = messages.map(msg => msg._id)

    await Messages.deleteMany({room: req.params.roomId})

    messages.map(msg =>{
      if((msg.url)&& msg.url !== ''){
        try {
          const imgUrl = msg.url.slice(29);

          fs.unlinkSync(path.resolve(__dirname, "..", "..", "..", "tmp", "message", imgUrl));
          
        } catch(err) {
          console.error(err)
          
        }

      }  
    })
    //console.log(messages)
    messages.map(x => console.log("console url",x.url))
    return res.json()
  }catch(err){
    console.log(err)
    return res.json({error: 'error on finding rooms'});
  }
});

  
module.exports = routes;