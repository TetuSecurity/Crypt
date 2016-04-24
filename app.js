const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const fs = require('fs');

try{
  fs.accessSync('./config.json');
  global.config = require('./config.json');
}
catch (err){
  global.config = {};
  fs.writeFileSync('./config.json', JSON.stringify(global.config));
  console.log('Initializing config file!');
}

if(!global.config.CookieSecret){
  var sec = crypto.randomBytes(32).toString('hex');
  global.config.CookieSecret = sec;
  fs.writeFileSync('./config.json', JSON.stringify(global.config, null, '\t'));
}

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser(global.config.CookieSecret));


app.all('*', function(req, res){
  return res.send('<h1>Hello World</h1>');
});


const port = global.config.Port || 3000;
app.listen(port);
console.log('App started on port', port);
