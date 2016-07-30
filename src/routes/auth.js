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
  if(!body || !body.Email){
    return res.send({Success: false, Error:'No info provided'});
  }
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
      var iq = 'Insert into `users` (`Email`, `Confirm`, `Active`) VALUES (?, ?, 0);';
      conn.query(iq, [body.Email, confirmation], function(err){
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
          email.confirm_email(body.Email, req.protocol+'://'+req.hostname+'/auth/confirm/'+confirmation, function(err){
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
                else{
                  conn.release();
                  return res.send({Success: true});  
                }
              });
            }
          });
        }
      });
    });
  });
});

router.get('/confirm/:confirmkey/:nonce', function(req, res){
  var confirmkey = req.params.confirmkey;
  var nonce = req.params.nonce;
  //Generate a challenge and store the expected response hashed
  var challenge = crypto.randomBytes(16).toString('base64');
  var salt = crypto.randomBytes(16).toString('base64');
  var challengeHash = crypto.createHash('sha512');
  var responseHash = challengeHash.update(salt+challenge).digest('base64');

  //encrypt the challenge with the provided nonce
  var cipher = crypto.createCipher('aes256', nonce);
  var enc_chall = cipher.update(challenge, 'base64', 'base64');
  enc_chall += cipher.final('base64');

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
      conn.query('Update `users` Set `Salt`=?, `ResponseHash`=? Where `Confirm`=?', [salt, responseHash, confirmkey], function(err, result){
        if(err){
          conn.rollback(function(){
            console.log('Error updating challenge for user', err);
            conn.release();
            return res.send({Success:false, Error: 'Internal Sever Error'});
          });
        }
        else if(result.affectedRows<1){
          conn.rollback(function(){
            conn.release();
            return res.send({Success:false, Error: 'Invalid Confirmation Key'});
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
              return res.send({Success:true, Challenge: enc_chall});
            }
          });
        }
      });
    });
  });
});

router.post('/confirm/', function(req, res){
  var body = req.body;
  if(!body || !body.Confirm || !body.Challenges){
    return res.send({Success: false, Error:'No info provided'});
  }
  var confirmkey = body.Confirm;
  var challenges = body.Challenges;

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
      conn.query('Select `ID` from `users` where `Active`=0 AND `Confirm`=? LIMIT 1;', [confirmkey], function(err, results){
        if(err){
          conn.rollback(function(){
            console.log('Error confirming email', err);
            conn.release();
            return res.send({Success:false, Error: 'Internal Sever Error'});
          });
        }
        else if(results.length != 1){
          conn.rollback(function(){
            conn.release();
            return res.send({Success:false, Error: 'Invalid Confirmation Key'});
          });
        }
        else{
          res.locals.user = results[0];
          conn.query('Update `users` Set `Challenge`=?, `ResetChallenge`=?, `Active`=1, `Confirm`=NULL where `ID`=?;', [challenges.Password, challenges.Reset, res.locals.user.ID], function(err, result){
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
  if(!body || !body.Email){
    return res.send({Success: false, Error:'No info provided'});
  }
  var nonce = crypto.randomBytes(16).toString('base64');
  db.query('Select * from `users` where `Email`=? and `Active`=1 LIMIT 1;', [body.Email], function(err, results){
    if(err){
      console.log('Error fetching user details for login', err);
      return res.send({Success: false, Error: 'Internal Server Error'});
    }
    if(results.length<1){
      return res.send({Success: false, Error: 'Incorrect Username or Password'});
    }
    else{
      var user = results[0];
      db.query('Update `users` set `LastNonce`=? Where `ID`=?;',[nonce, user.ID], function(err, result){
        if(err){
          console.log(err);
          return res.send({Success: false, Error:'Internal Server Error'});
        }
        return res.send({Success:true, Challenge: user.Challenge, Nonce: nonce});
      });
    }
  });
});

router.post('/login/2', function(req, res){
  var body = req.body;
  if(!body || !body.Email || !body.Response){
    return res.send({Success: false, Error:'No info provided'});
  }
  db.query('Select * from `users` where `Email`=? and `Active`=1 LIMIT 1;', [body.Email], function(err, results){
    if(err){
      console.log('Error fetching user details for login', err);
      return res.send({Success: false, Error: 'Internal Server Error'});
    }
    if(results.length<1){
      return res.send({Success: false, Error: 'Incorrect Username or Password'});
    }
    else{
      var user = results[0];
      var decipher = crypto.createDecipher('aes256', user.LastNonce);
      var response = decipher.update(body.Response, 'base64', 'base64');
      response += decipher.final('base64');
      var rhash = crypto.createHash('sha512');
      var comp = rhash.update(user.Salt+response).digest('base64');
      if(comp == user.ResponseHash){
        db.query('Update `users` set `LastNonce`=NULL where `ID`=?;', [user.ID], function(err, result){
          if(err){
            console.log('Error recycling nonce', err);
            return res.send({Success: false, Error: 'Internal Server Error'});
          }
          // @TODO: check for 2FA
          var session = uuid.v4();
          var timediff = 60*60*6; // 6 hours
          var expires = ~~(new Date()/1000)+timediff;
          db.query('Insert into `sessions` (`Session_ID`, `User_ID`, `Expires`) VALUES(?, ?, ?);', [session, user.ID, expires], function(err, result){
            if(err){
              console.log('Error Saving Session ID', err);
              return res.send({Success: false, Error: 'Internal Server Error'});
            }
            var c_obj = {secure: req.secure, signed:true, httpOnly:true};
            if(body.Remember){
              c_obj.maxAge = timediff*1000;
            }
            res.cookie(global.config.Cookie.Name, session, c_obj);
            return res.send({Success: true, User: {ID:user.ID, Email:user.Email}});
          });
        });
      }
      else{
        return res.send({Success: false, Error: 'Incorrect Username or Password'});
      }
    }
  });
});

module.exports=router;
