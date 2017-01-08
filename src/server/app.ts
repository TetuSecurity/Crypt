import {join} from 'path';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import * as morgan from 'morgan';

require('dotenv').config();

const APP_CONFIG = {
  environment: process.env.ENVIRONMENT || 'dev',
  cookie_name: process.env.COOKIE_NAME || 'cookie_name',
  cookie_secret: process.env.COOKIE_SECRET || 'cookie_secret',
  port: process.env.NODE_PORT || 3000,
  log_level: process.env.MORGAN_LOG_LEVEL || 'dev',
  storage_key: process.env.STORAGE_KEY || 'storage_key'
};

const app = express();

app.use(bodyParser.json({limit: '100mb'}));
app.use(cookieParser(APP_CONFIG.cookie_secret));

app.use(morgan(APP_CONFIG.log_level));

/*-------- API --------*/
app.use('/api', require('./routes/api')(APP_CONFIG));

/*------- Angular client on Root ------- */
app.set('view engine', 'html');
app.use(express.static(join(__dirname, '../client')));
app.get('/*', (req, res) => {
  return res.sendFile(join(__dirname, '../client/index.html'));
});

app.all('*', (req, res) => {
  return res.status(404).send('404 UNKNOWN ROUTE');
});

/*
* ADD SSL STUFF HERE
*/
// let server = app;
// if('SSL' in global.config){
//   var config = {
//     key: fs.readFileSync(global.config.SSL.keyfile),
//     cert: fs.readFileSync(global.config.SSL.certfile),
//     ca: fs.readFileSync(global.config.SSL.chainfile)
//   };
//   const https = require('https');
//   server = https.createServer(config, app);
// }
// server.listen(port);

app.listen(APP_CONFIG.port);
console.log('App started on port', APP_CONFIG.port);
