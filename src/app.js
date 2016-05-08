const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
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

/*------- Angular client on Root ------- */
app.set('view engine','html');
app.use(express.static(path.join(__dirname, 'client')));

/*-------- API --------*/
app.use('/api', require('./routes/api'));

app.all('*', function(req, res){
  res.status=404;
  return res.send('<h1>404: Not Found</h1>');
});

const port = global.config.Port || 3000;
app.listen(port);
console.log('App started on port', port);
