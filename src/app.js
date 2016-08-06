const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const morgan = require('morgan');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

try{
  fs.accessSync(path.join(__dirname,'./config.json'));
  global.config = require('./config.json');
}
catch (err){
  global.config = {};
  fs.writeFileSync(path.join(__dirname,'./config.json'), JSON.stringify(global.config));
  console.log('Initializing config file!');
}

if(!global.config.Cookie){
  global.config.Cookie= {};
}
if(!global.config.Cookie.Secret || !global.config.Cookie.Name){
  var sec = global.config.Cookie.Secret || crypto.randomBytes(32).toString('base64');
  var cookieName = global.config.Cookie.Name||'cr_t2s';
  global.config.Cookie = {Secret: sec, Name:cookieName};
  fs.writeFileSync(path.join(__dirname,'./config.json'), JSON.stringify(global.config, null, '\t'));
}

if(!global.config.StorageKey){
  global.config.StorageKey = crypto.randomBytes(64).toString('base64');
  fs.writeFileSync(path.join(__dirname,'./config.json'), JSON.stringify(global.config, null, '\t'));
}

const app = express();
global.jsonParser = bodyParser.json({limit:'100mb'});
global.urlParser = bodyParser.urlencoded({ extended: true });
app.use(cookieParser(global.config.Cookie.Secret));

app.use(morgan('dev'));

/*-------- API --------*/
app.use('/api', require('./routes/api'));

/*------- Angular client on Root ------- */
app.set('view engine','html');
app.use(express.static(path.join(__dirname, 'client')));
app.get('/*', function(req, res){
  return res.sendFile(path.join(__dirname, 'client/index.html'));
});

app.all('*', function(req, res){
  res.status=404;
  return res.send({Success: false, Error: 'Unknown Route'});
});

const port = global.config.Port || 3000;
app.listen(port);
console.log('App started on port', port);
