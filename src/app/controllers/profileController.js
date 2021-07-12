const routes = require('express').Router();

const Users = require('../models/users').model('user');

const authMiddleware = require('../../app/middlewares/auth')

routes.use(authMiddleware)

routes.post('/', (req, res) => {
  return res.json({ response: 'talvez tenha dado bom'})
})

module.exports = routes;
