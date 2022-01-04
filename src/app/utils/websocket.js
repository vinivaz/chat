const { on } = require('events');
const express = require('express');
const path = require('path')
const authConfig = require('../middlewares/auth');
const online = require('../models/overview')
function socketIo(app) {

  // function removeItemOnce(arr, value) {
  //   var index = arr.indexOf(value);
  //   if (index > -1) {
  //     arr.splice(index, 1);
  //   }
    

  //   return arr;
  // }

  function isView(req, res, next){
    req.isView = true;
    next()
  }
  
  app.use('/views', express.static(path.join(__dirname, '..', '..', 'public')));
  app.set('views', path.join(__dirname, '..', '..', 'public'));
  app.engine('html', require('ejs').renderFile);
  app.set('view engine', 'html');

  app.use('/views/login', (req, res) => {
    return res.render('login.html')
  })
  app.use('/views/chat', (req, res) => {
    return res.render('index.html')
  })
  //settar o token pra parte de requisições e so socket io, n nos views
  let messages = [];

  let onlineProfiles = new Map();

  function addUserToOnlineMap(userId, socketId){
    if(!onlineProfiles.has(userId)){
      onlineProfiles.set(userId, new Set([socketId]))
    }else{
      onlineProfiles.get(userId).add(socketId)
    }
  }

  function removeUserToOnlineMap(userId, socketId){

    console.log(userId, socketId)

    if(userId){
      if(onlineProfiles.has(userId)){
        let userIdOnline = onlineProfiles.get(userId)
        userIdOnline.delete(socketId)
        if(userIdOnline.size == 0){
          onlineProfiles.delete(userId)
        }
      }
    }

    console.log("testeee", Array.from(onlineProfiles.keys()))
    
  }

  const server = require('http').createServer(app);
  const { Server } = require('socket.io');
  const io = new Server(server, {
    cors: {
    origin: "http://localhost:3001",
    methods: ["GET", "POST"]
  }
  });

  io.on('connection', (socket) => {

    console.log(`Coooooooooooooooonnected: ${socket.id}`)

    let socketRoom;
    let socketProfileId;

    socket.on('online-profile', profileId => {
      socket.join(profileId)
      console.log(`Socket ${socket.id} esta logadoo ${profileId}`);
      socketProfileId = profileId


      console.log('pode recarregar')
      addUserToOnlineMap(profileId, socket.id)

      io.emit('online-users', Array.from(onlineProfiles.keys()))
      console.log(Array.from(onlineProfiles.keys()))
    })
    
    socket.on('join-room', room => {
      socket.join(room)
      console.log(`Socket ${socket.id} joining ${room}`);
      socketRoom = room
    })


    socket.on('leave-room', room => {
      socket.leave(room)
      socketRoom = null;
      //console.log('tal usuario saiu de tal sala blablah: ',room)
    })

    socket.on('switch', (data) => {
      const { prevRoom, nextRoom } = data;
      if (prevRoom) socket.leave(prevRoom);
      if (nextRoom) socket.join(nextRoom);
      console.log(`Socket ${socket.id} left ${prevRoom}`);
      socketRoom = nextRoom;
    });

    socket.on('send-msg', (roomData, newMsg) => {
        //socket.removeAllListeners()
        socket.broadcast.to(socketRoom).emit("receive-msg", newMsg);

        //console.log('mensagem: ', newMsg, 'room: ', socketRoom)

        let updatedRoom = roomData;

        if(newMsg.text !== undefined && newMsg.text !== null){
          if(newMsg.text.length > 15){

            var lastMsgSample = newMsg.text.slice(0, -(newMsg.text.length - 15)) + "..."
            
          }else{
            var lastMsgSample = newMsg.text
          }
        }else{
          var lastMsgSample = '*Picture*'
        }
        updatedRoom.lastMessage = lastMsgSample;

        //console.log('updatedRoom.users[0]: ', updatedRoom.users[0]._id, 'updatedRoom.users[1]: ', updatedRoom.users[1]._id)

         io.to(updatedRoom.users[0]._id).to(updatedRoom.users[1]._id).emit("update-room-list", updatedRoom)
        // updatedRoom.users.map(user => {
        //   console.log('testandoUser', user)
        //   //socket.broadcast.to(user).emit("update-room-list", updatedRoom);
        // })

        // io.to(updatedRoom.users[0]).to(updatedRoom.users[1]).emit("update-room-list", updatedRoom)
        // updatedRoom.users.map(user => {
        //   console.log('testandoUser', user)
        //   //socket.broadcast.to(user).emit("update-room-list", updatedRoom);
        // })

    })

    
    socket.on('delete-chat-history', (roomData, user) => {
      //console.log("rooom",room)
      socket.to(roomData._id).emit("destroy-history");
      socket.broadcast.to(user).emit("remove-room", user);
      //socket.broadcast.to(room.users[1]).emit("remove-room", room._id);
    })

    socket.on('typing-event', ({user, value, room}) => {
      //console.log('room: ',room, 'userId: ', user,  'value: ', value)
      socket.broadcast.to(room).emit("typing-feedback", user, value);
    })

    socket.on('delete-msg', (room, msgId) => {
      
      socket.broadcast.to(room).emit("remove-msg", msgId);

      console.log('removendo msg dessa sala: ',room, "id da menssagem: ", msgId)
    })

    
    socket.on('disconnect', () =>{
      console.log(`Disconnected: ${socket.id}`)
      removeUserToOnlineMap(socketProfileId, socket.id)
      io.emit('online-users', Array.from(onlineProfiles.keys()))
    });

    socket.on('test', msg =>{
      
      console.log(msg)
      //.broadcast.emit('receivedMessage', msg);

    });
    
  });
  server.listen(process.env.SERVER_PORT||3000);
}

module.exports = socketIo;

