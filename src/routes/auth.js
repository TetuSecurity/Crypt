var router = require('express').Router();
var crypto = require('crypto');
var uuid = require('node-uuid');
var db = require('../middleware/db');

router.get('/', function(req, res){
  if(res.locals.user){
    return res.send({Success: true, User: res.locals.user});
  }
  else{
    return res.send({Success: false, Error: 'Unauthenticated!'});
  }
});

router.post('/signup', function(req, res){
  var body = req.body;
  if(!body || !body.Email || !body.Password){
    return res.send({Success: false, Error:'No info provided'});
  }
  var salt = crypto.randomBytes(16).toString('hex');
  var passhash = crypto.createHash('sha512');
  passhash.update(body.Password);
  passhash.update(salt);
  var hpass = passhash.digest('hex');
  var confirmation = uuid.v4();
  var iq = 'Insert into `users` (`Email`, `Salt`, `PasswordHash`,`Confirm`, `Active`) VALUES (?, ?, ?, ?, 0);';
  db.query(iq, [body.Email, salt, hpass, confirmation], function(err){
    if(err){
      if(err.code == 'ER_DUP_KEY'){
        return res.send({Success: false, Error:'User with that email already exists!'});
      }
      else{
        console.log(err);
        return res.send({Success: false, Error: 'Internal Server Error'});
      }
    }
    //Send email
    return res.send({Success: true});
  });
});

router.get('/confirm/:confirmkey', function(req, res){
  var confirmkey = req.params.confirmkey;
  db.query('Update `users` Set `Active`=1, `Confirm`=NULL where `Confirm`=?;', [confirmkey], function(err, result){
    if(err){
      console.log('Error confirming email', err);
      return res.send({Success:false, Error: 'Internal Sever Error'});
    }
    if(result.changedRows <1){
      return res.send({Success: false, Error: 'Invalid Confirmation Key'});
    }
    return res.send({Success: true});
  });
});

router.post('/login', function(req, res){
  var body = req.body;
  if(!body || !body.Email || !body.Password){
    return res.send({Success: false, Error:'No info provided'});
  }
  db.query('Select * from `users` where `Email`=? and `Active`=1 LIMIT 1;', [body.Email], function(err, results){
    if(err){
      console.log('Error fetching user details for login', err);
      return res.send({Success: false, Error: 'Internal Server Error'});
    }
    var passhash = crypto.createHash('sha512');
    passhash.update(body.Password);
    if(results.length<1){
      var h = passhash.digest('hex'); //compute the hash anyway so that you cannot determine an unknown user from an incorrect password by request time
      return res.send({Success: false, Error: 'Incorrect Username or Password'});
    }
    else{
      passhash.update(results[0].Salt);
      var comp = passhash.digest('hex');
      if(comp == results[0].PasswordHash){
        var u = results[0];
        delete u.PasswordHash;
        delete u.Salt;
        delete u.Confirm;
        var session = uuid.v4();
        var timediff = 60*60*6; // 6 hours
        var expires = ~~(new Date()/1000)+timediff;
        db.query('Insert into `sessions` (`Session_ID`, `User_ID`, `Expires`) VALUES(?, ?, ?);', [session, u.ID, expires], function(err, result){
          if(err){
            console.log('Error Saving Session ID', err);
            return res.send({Success: false, Error: 'Internal Server Error'});
          }
          res.cookie(global.config.Cookie.Name, session, {maxAge: timediff*1000, secure: req.secure, signed:true});
          return res.send({Success: true, User: u});
        });
      }
      else{
        return res.send({Success: false, Error: 'Incorrect Username or Password'});
      }
    }
  });
});

module.exports=router;
