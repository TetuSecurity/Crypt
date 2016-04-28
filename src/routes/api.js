const router = require('express').Router();
const db = require('../middleware/db');

router.use(function(req, res, next){
  if(!req.signedCookies || !req.signedCookies[global.config.Cookie.Name]){
    res.locals.user = null;
    return next();
  }
  else{
    var a_sess = req.signedCookies[global.config.Cookie.Name];
    db.query('Select `users`.* from `sessions` join `users` on `users`.`ID` = `sessions`.`User_ID` Where `Session_ID`=? and `Expires`>?;', [a_sess, ~~(new Date()/1000)], function(err, results){
      if(err){
        console.log('Error connecting to auth service');
        return res.send({Success: false, Error: 'Could not retrieve session'});
      }
      if(results.length<1){
        res.locals.user = null;
        return next();
      }
      else{
        res.locals.user = results[0];
        delete res.locals.user.PasswordHash;
        delete res.locals.user.Salt;
        delete res.locals.user.Confirm;
        return next();
      }
    });
  }
});

router.use('/auth', require('./auth'));

module.exports=router;
