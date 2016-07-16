const router = require('express').Router();
const crypto = require('crypto');
const uuid = require('node-uuid');
const db = require('../middleware/db');
const email = require('../middleware/email');

router.use(global.jsonParser);

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
  db.getConnection(function(err, conn){
    if(err){
      console.log('Error connecting to database', err);
      return res.send({Success: false, Error: 'Internal Server Error'});
    }
    conn.beginTransaction(function(err){
      if(err){
        console.log('Error beginning signup transaction', err);
        conn.release();
        return res.send({Success: false, Error: 'Internal Server Error'});
      }
      var iq = 'Insert into `users` (`Email`, `Salt`, `PasswordHash`,`Confirm`, `Active`) VALUES (?, ?, ?, ?, 0);';
      conn.query(iq, [body.Email, salt, hpass, confirmation], function(err){
        if(err){
          if(err.code == 'ER_DUP_KEY'){
            conn.rollback(function(){
              conn.release();
              return res.send({Success: false, Error:'User with that email already exists!'});
            });
          }
          else{
            conn.rollback(function(){
              console.log(err);
              conn.release();
              return res.send({Success: false, Error: 'Internal Server Error'});
            });
          }
        }
        else{
          email.confirm_email(body.Email, req.protocol+'://'+req.hostname+'/api/auth/confirm/'+confirmation, function(err){
            if(err){
              conn.rollback(function(){
                console.log('Error sending confirmation email', err);
                conn.release();
                return res.send({Success: false, Error: 'Internal Server Error'});
              });
            }
            else{
              conn.commit(function(err){
                if(err) {
                  conn.rollback(function(){
                    console.log(err);
                    conn.release();
                    return res.send({Success: false, Error: 'Internal Server Error'});
                  });
                }
                conn.release();
                return res.send({Success: true});
              });
            }
          });
        }
      });
    });
  });
});

router.get('/confirm/:confirmkey', function(req, res){
  var confirmkey = req.params.confirmkey;
  db.getConnection(function(err, conn){
    if(err){
      console.log('Error connecting to database', err);
      return res.send({Success: false, Error: 'Internal Server Error'});
    }
    conn.beginTransaction(function(err){
      if(err){
        console.log('Error beginning confirmation transaction', err);
        conn.release();
        return res.send({Success: false, Error: 'Internal Server Error'});
      }
      conn.query('Select * from `users` where `Active`=0 and `Confirm` = ? LIMIT 1;', [confirmkey], function(err, results){
        if(err){
          conn.rollback(function(){
            console.log('Error confirming email', err);
            conn.release();
            return res.send({Success:false, Error: 'Internal Sever Error'});
          });
        }
        else if(results.length<1){
          conn.rollback(function(){
            conn.release();
            return res.send({Success: false, Error: 'Invalid Confirmation Key'});
          });
        }
        else{
          res.locals.user = results[0];
          conn.query('Update `users` Set `Active`=1, `Confirm`=NULL where `ID`=?;', [res.locals.user.ID], function(err, result){
            if(err){
              conn.rollback(function(){
                console.log('Error confirming email', err);
                conn.release();
                return res.send({Success:false, Error: 'Internal Sever Error'});
              });
            }
            else{
              conn.query('Insert into `filemetadata` (`Name`, `Owner`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `Name`=`Name`;', ['/', res.locals.user.ID], function(err, result2){
                if(err){
                  conn.rollback(function(){
                    conn.release();
                    return res.send({Success: false, Error: 'Error creating home directory'});
                  });
                }
                else{
                  conn.commit(function(err){
                    if(err){
                      conn.rollback(function(){
                        console.log(err);
                        conn.release();
                        return res.send({Success: false, Error: 'Internal Server Error'});
                      });
                    }
                    else{
                      conn.release();
                      return res.redirect('/');
                    }
                  });
                }
              });
            }
          });
        }
      });
    });
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
          var c_obj = {secure: req.secure, signed:true, httpOnly:true};
          if(body.Remember){
            c_obj.maxAge = timediff*1000;
          }
          res.cookie(global.config.Cookie.Name, session, c_obj);
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
