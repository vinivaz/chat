const jwt = require('jsonwebtoken');
const authConfig = require('../../config/auth.json');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  

  if(!authHeader) {
    if(req.isView){
      return res.render('login.html')
    }
      return res.json({ error: "No token providen" })
  }

  const parts = authHeader.split(' ');
  

  if(!(parts.length === 2)) {
    return res.json({ error: 'Token error' });
  }

  const [ scheme, token ] = parts;
  

  if(!/^Bearer$/i.test(scheme)){
    
    return res.json({ error: "Token malformated" });
  }

  jwt.verify(token, authConfig.secret, (err, decode) => {
    if(err){
      /*if(req.isView){
        return res.render('login.html')
      }*/
      return res.json({ error: "Invalid token" });
    }
    req.userId = decode.id;

    next()
  })
};