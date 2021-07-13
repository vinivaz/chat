const routes = require('express').Router();
const userConstroller = require('./app/controllers/userController');


const auth = require('./app/middlewares/auth')

routes.get('/user/list', userConstroller.list);
routes.post('/user/register', userConstroller.register);
routes.post('/user/authenticate', userConstroller.auth);
routes.post('/user/forgot_password', userConstroller.forgotPassword);
routes.post('/user/change_password', userConstroller.changePassword);
routes.delete('/user/delete', userConstroller.delete);

routes.use('/user/profile', require('./app/controllers/profileController'))

routes.get("/teste",  auth, (req, res) => {
  return res.json({ authenticated: true, userId: req.userId })
})
module.exports = routes;