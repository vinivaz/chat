const { on } = require('events');
const express = require('express');
const path = require('path')
const authConfig = require('../middlewares/auth');
const online = require('../models/overview')
function socketIo(app) {

  function removeItemOnce(arr, value) {
    var index = arr.indexOf(value);
    if (index > -1) {
      arr.splice(index, 1);
    }
    

    return arr;
  }

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

  let onlines = [];

  /*const seila = async(user) => {
    await online.create({user})
    return online
  }*/

  const server = require('http').createServer(app);
  const { Server } = require('socket.io');
  const io = new Server(server);

  io.on('connection', (socket) => {
    onlines.push(socket.id)
    socket.emit('online', onlines);
    
    
    
    console.log(onlines)
    //const people = await online.create({online:[socket.id]})
    //console.log(people)
    

    console.log(`User conectado, ${socket.id}`)

    socket.on('disconnect', ()=> {
      //console.log(socket.id)
      onlines = removeItemOnce(onlines, socket.id)
      console.log(onlines)
      socket.emit('online', onlines)
      /*
      removeItemOnce(people, socket.id)
      console.log(socket.id, people)
      io.emit('online', people)
      console.log('111dasdsadasdasdsad')*/
    })

    socket.emit('previousMessages', messages)


    socket.on('chat message', msg =>{
      messages.push(msg)
      
      console.log(messages)
      socket.broadcast.emit('receivedMessage', msg);

    });
    
  });
  server.listen(process.env.SERVER_PORT||3000);
}

module.exports = socketIo;