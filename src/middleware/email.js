var uuid = require('node-uuid');
var nodemailer  = require('nodemailer');
var db = require('./db');
var transporter;
var sesTransport;

if(global.config.Email){
  if(global.config.Email.SMTP){
    //connect with SMTP config
    transporter = nodemailer.createTransport(global.config.Email.SMTP);
  }
  else if(global.config.Email.SES){
    //connect with SES config
    sesTransport= require('nodemailer-ses-transport');
    transporter = nodemailer.createTransport(sesTransport(global.config.Email.SES));
  }
  else{
    //try to connect to SES through EC2 role
    sesTransport= require('nodemailer-ses-transport');
    transporter = nodemailer.createTransport(sesTransport());
  }
}
else{
  //try to connect to SES through EC2 role
  sesTransport= require('nodemailer-ses-transport');
  transporter = nodemailer.createTransport(sesTransport());
}

module.exports={
  confirm_email: function(to, confirmlink, callback){
    var pt = "To confirm your Crypt account, please visit "+ confirmlink + " in your browser.";
    var html = '<p>To confirm your Crypt account, please visit <a href="'+confirmlink+'" alt="confirmation">'+confirmlink+'</a> in a browser.</p>';
    transporter.sendMail({
      from: global.config.Email.From || "Crypt@yoursite.com",
      to: to,
      subject: 'Please confirm your email for Crypt',
      text: pt,
      html: html
    }, function(err, info){
      if(err){
        return callback(err);
      }
      return callback();
    });
  }
};
