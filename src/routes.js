const routes = require('express').Router();

const userController = require('./app/controllers/userController');

const auth = require('./app/middlewares/auth')

routes
  .get('/user/list', userController.list)
  .post('/user/register', userController.register)
  .post('/user/authenticate', userController.auth)
  .post('/user/forgot_password', userController.forgotPassword)
  .post('/user/change_password', userController.changePassword)
  .delete('/user/delete', userController.delete)

  .use('/user/profile', require('./app/controllers/profileController'))
  .use('/user/rooms', require('./app/controllers/roomController'))
  .use('/messages', require('./app/controllers/messageController'))

  .get("/teste",  auth, (req, res) => {
    return res.json({ authenticated: true, userId: req.userId })
  })
  
  
module.exports = routes;