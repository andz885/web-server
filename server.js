//nefunguje email

const express = require('express');
const port = process.env.PORT || 3000;
const validator = require('validator');
const SHA256 = require('crypto-js').SHA256;
const jwt = require('jsonwebtoken');
const EMAIL_HTML = '<div style="text-align:center; margin-top:30px; margin-bottom:0px;"><a style="background:#3C5D6E; font-family:sans-serif; text-decoration:none; font-size:16px; color:white; padding:10px 15px; border-radius:2px;" <placeForURI> target="_blank">Click Here</a></div><div style="margin:20px auto; font-family:system-ui; font-weight:100; font-size:20px; text-align:center;">to create your new password</div>';
const SECRET = 'k^p^Fc-Cw$dd#S]';
const MCU_KEY = 'HPG2PU3U5BIM7O1OVVNOZ2YVGX8BTICORE2EIEY02Z8ZW4K8N4Q3Y4UGOWQKFKY9';
const ADMIN = {
  email: 'admin',
  password: SHA256('adminpass').toString() //smrecany1265
}

var randomstring = require("randomstring");
var bodyParser = require('body-parser');
var app = express();
var mongoose = require('mongoose');
var favicon = require('serve-favicon');
var nodemailer = require('nodemailer');
var enforce = require('express-sslify');
var transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  // secure: true,
  auth: {
    user: 'plplwu5tt3mt7t6t@ethereal.email',
    pass: 'sefcJYxvnrqYkwUj1g'
  },
});

var accountSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  password: String,
  role: String,
  cardUID: String
}, {
  versionKey: false,
  collection: 'accounts'
});
var accounts = mongoose.model('accounts', accountSchema);

var attendanceSchema = new mongoose.Schema({
  user_id: String,
  action: String,
  time: String,
  inserted_by: String
}, {
  versionKey: false,
  collection: 'attendances'
});
var attendance = mongoose.model('attendances', attendanceSchema);

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tomko', {
  useNewUrlParser: true
});

if (process.env.PORT) {
  app.use(enforce.HTTPS({
    trustProtoHeader: true
  }));
}
app.set('view engine', 'html');
app.set('views', __dirname + '/public/html');
app.engine('html', require('ejs').renderFile);
app.use(express.static(__dirname + '/public/css'));
app.use(express.static(__dirname + '/public/js'));
app.use(express.static(__dirname + '/public/images'));
app.use(favicon(__dirname + '/public/images/favicon.ico')); //tomko tab icon
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

function htmlEmailGenerate(uri) {
  return EMAIL_HTML.replace('<placeForURI>', `href="${uri}"`)
}

function sendEmail(senderName, reciverEmail, subject, html, callback) {
  let mailOptions = {
    from: `${senderName} <no-reply@atsy.space>`,
    to: reciverEmail,
    subject,
    html
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (info) {
      info.response = info.response.replace('250 Accepted [STATUS=new MSGID=', '[');
      info.response = info.response.replace('[', '');
      info.response = info.response.replace(']', '');
    }
    callback('https://ethereal.email/message/' + info.response);
  });
}

function tokenGenerate(firstName, lastName, email, role) {
  return jwt.sign({
    firstName,
    lastName,
    email,
    role
  }, SECRET).toString()
}


function verifyJWT(token) {
  var result;
  jwt.verify(token, SECRET, function(err, payload) {
    if (err) {
      result = null;
    } else if ((((new Date).getTime() / 1000) - payload.iat) < 32460) {
      result = payload;
    } else {
      result = null;
    }
  });
  return result;
}

app.post('/refreshtoken', (req, res) => { //page asking for renew token
  var token = verifyJWT(req.body.token);
  if (!token) {
    res.setHeader('x-status', 'bad token');
    res.send();
  } else {
    res.setHeader('x-status', 'ok');
    res.setHeader('token', tokenGenerate(token.firstName, token.lastName, token.email, token.role));
    res.send();
  }
});

app.get('/newpassowrd', (req, res) => {
  var token = verifyJWT(req.query.token);
  if (!token) {
    res.setHeader('x-status', 'your link is invalid');
    res.render('statusprint.html');
  } else {
    accounts.findOne({
      email: token.email,
      password: 'undefined'
    }).then((doc) => {
      if (!doc) {
        res.setHeader('x-status', 'No database record');
        res.render('statusprint.html');
        return
      }
      res.setHeader('token', req.query.token);
      res.render('newpassowrd.html');
    }, (e) => {
      res.setHeader('x-status', 'Unable to browse database');
      res.render('statusprint.html')
    });
  }
});

app.get('*', (req, res) => {
  var token = verifyJWT(req.headers.token);
  if (!token) {
    res.render('form.html');
  } else if (token.role === "true") {
    var tabPage = req.params[0].replace('/', '') + '.html';
    res.setHeader('x-status', 'ok');
    res.render(tabPage);
  } else {
    res.send('you are not administrator');
  }
});

app.post('/form', (req, res) => {
  var token = verifyJWT(req.body.token);
  if (!token) {
    res.render('login.html');
  } else if (token.role === "true") {
    res.render('homepage.html'); //homepage for administrators
  } else {
    res.send("not administrator page"); //homepage for non administrators
  }
});


app.post('/loginverify', (req, res) => {
  var loginData = {
    email: req.body.email,
    password: SHA256(req.body.pass).toString()
  };
  if (JSON.stringify(loginData) === JSON.stringify(ADMIN)) {
    res.setHeader('token', tokenGenerate('admin', '', '', 'true'));
    res.setHeader('x-status', 'ok');
    res.send();
    return
  }
  accounts.findOne(loginData).then((doc) => {
    if (!doc) {
      res.setHeader('x-status', 'Invalid Name or Password');
      res.send();
      return
    }
    res.setHeader('token', tokenGenerate(doc.firstName, doc.lastName, doc.email, doc.role));
    res.setHeader('x-status', 'ok');
    res.send();
  }, (e) => {
    res.setHeader('x-status', 'Unable to browse database');
    res.send();
  });
});



app.post('/adduser', (req, res) => {
  var token = verifyJWT(req.body.token);
  if (!token) {
    res.setHeader('x-status', 'bad token, cannot add the new user');
    res.send();
  } else if (token.role === 'true') {
    accounts.findOne({
      $or: [{
        email: req.body.email
      }, {
        cardUID: req.body.cardUID
      }]
    }).then((doc) => {
      if (!doc) {
        var acc = new accounts({
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          email: req.body.email,
          cardUID: req.body.cardUID,
          password: 'undefined',
          role: req.body.role
        });
        acc.save().then(() => {
          res.setHeader('x-status', 'ok'); //send ma byt tu a sendEmail nemá navratovú hodnotu
          let html = htmlEmailGenerate(`${process.env.PORT ? "https://" : "http://"}` + req.headers.host + '/newpassowrd?token=' + tokenGenerate(req.body.firstName, req.body.lastName, req.body.email, req.body.role));
          sendEmail('TOMKO', req.body.email, `Welcome on board ${req.body.firstName}!`, html, (info) => {
            res.setHeader('messageID', info);
            res.send();
          });
        }, (e) => {
          res.setHeader('x-status', 'database problem, cannot add new user');
          res.send();
        });
      } else {
        if (doc.email === req.body.email) {
          res.setHeader('x-status', 'Email is already used');
          res.send();
        } else if (doc.cardUID === req.body.cardUID) {
          res.setHeader('x-status', 'Card UID is already used');
          res.send();
        } else {
          res.setHeader('x-status', 'database problem, wrong searching results');
          res.send();
        }
      }
    }, (e) => {
      res.setHeader('x-status', 'database problem, cannot verify the email');
    });
  } else {
    res.setHeader('x-status', 'you have no permissions');
    res.send();
  }
});


app.post('/addpassword', (req, res) => {
  var token = verifyJWT(req.body.token);
  if (!token) {
    res.setHeader('x-status', 'your link is invalid');
    res.send();
  } else {
    accounts.findOneAndUpdate({
      email: token.email,
      password: 'undefined'
    }, {
      $set: {
        password: SHA256(req.body.pass).toString()
      }
    }).then((doc) => {
      if (!doc) {
        res.setHeader('x-status', 'No database record');
        res.send();
        return
      }
      res.setHeader('x-status', 'ok');
      res.send();
    }, (e) => {
      res.setHeader('x-status', 'Unable to browse database');
      res.send()
    });
  }
});


app.post('/cardattached', (req, res) => {
  if (req.body.MCU_KEY !== MCU_KEY) {
    res.send('invalid MCU key');
    return;
  }
  if (req.body.cardUID.length === 8) {
    accounts.findOne({
      cardUID: req.body.cardUID
    }).then((doc) => {
      if (!doc) {
        res.send('could not find a user');
        return
      }
      var att = new attendance({
        user_id: doc._id,
        action: req.body.action,
        time: req.body.time
      });
      att.save().then(() => {
        res.send('ok');
      }, (e) => {
        res.send('cannot instert document into attendance');
      });
    }, (e) => {
      res.send('cannot browse accounts database');
    });
  } else {
    res.send('invalid card ID');
  }
});


app.listen(port);
