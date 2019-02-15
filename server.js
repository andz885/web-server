//zošiť z matematiky, 3D TOMKO krabička

const express = require('express');
const validator = require('validator');
const SHA256 = require('crypto-js').SHA256;
const jwt = require('jsonwebtoken');
const EMAIL_HTML = '<div style="text-align:center; margin-top:30px; margin-bottom:0px;"><a style="background:#3C5D6E; font-family:sans-serif; text-decoration:none; font-size:16px; color:white; padding:10px 15px; border-radius:2px;" <placeForURI> target="_blank">Click Here</a></div><div style="margin:20px auto; font-family:system-ui; font-weight:100; font-size:20px; text-align:center;">to create your new password</div>';

const port = process.env.PORT || 3000;
const SECRET = process.env.SECRET || 'Mp;|wP78jka(rRf-aO}dZ~cFxFEf';
const MCU_KEY = process.env.MCU_KEY || 'localhostMcuKey';
const ADMIN_LOGIN = {
  email: process.env.ADMIN_EMAIL || 'admin',
  password: SHA256(process.env.ADMIN_PASSWORD || 'adminpass').toString()
}

var stringify = require('json-stringify-safe');
var cookieParser = require('cookie-parser');
var randomstring = require("randomstring");
var bodyParser = require('body-parser');
var app = express();
var mongoose = require('mongoose');
var favicon = require('serve-favicon');
var nodemailer = require('nodemailer');
var enforce = require('express-sslify');
var transporter = nodemailer.createTransport({
  host: `${process.env.PORT ? "smtp.zoho.com" : "smtp.ethereal.email"}`,
  port: process.env.PORT ? 465 : 587,
  secure: process.env.PORT ? true : undefined,
  auth: {
    user: process.env.EMAIL_USERNAME || 'i73epgl72yzaebox@ethereal.email',
    pass: process.env.EMAIL_PASSWORD || 'Tb1THW7xXzaPRFGVxc'
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
  action: String, //departure
  type: String, //doctor
  from: String, //user
  date: Date,
}, {
  versionKey: false,
  collection: 'attendances'
});
var attendance = mongoose.model('attendances', attendanceSchema);

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tomko', {useNewUrlParser: true});

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

if (process.env.PORT) {app.use(enforce.HTTPS({trustProtoHeader: true}));}
app.set('view engine', 'html');
app.set('views', __dirname + '/public/html');
app.engine('html', require('ejs').renderFile);
app.use(express.static(__dirname + '/public/css'));
app.use(express.static(__dirname + '/public/js'));
app.use(express.static(__dirname + '/public/images'));
app.use(favicon(__dirname + '/public/images/favicon.ico')); //tomko tab icon
app.use(bodyParser.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(function(req, res, next) {
  var token = verifyJWT(req.cookies.token);
  if (token) {
    res.cookie('token', tokenGenerate(token.firstName, token.lastName, token.email, token.role));
    next();
  } else if (verifyJWT(req.query.token) || req.url === '/loginverify' || req.url === '/addpassword') {
    next();
  } else if ((req.url === '/cardattached' || req.url === '/getunixtime') && req.headers.mcu_key === MCU_KEY) {
    next();
  } else if (req.method === 'GET') {
    res.render('login.html');
  } else {
    res.status(401).send('UNAUTHORIZED');
  }
});

function htmlEmailGenerate(uri) {
  return EMAIL_HTML.replace('<placeForURI>', `href="${uri}"`)
}

function sendEmail(senderName, reciverEmail, subject, html) {
  let mailOptions = {
    from: `${senderName} <noreply@atsy.space>`,
    to: reciverEmail,
    subject,
    html
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if(info) console.log(info);
    else console.log(error);
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


app.get('/newpassowrd', (req, res) => {
    accounts.findOne({
      email: verifyJWT(req.query.token).email,
      password: 'undefined'
    }).then((doc) => {
      if (!doc) {
        res.send('No database record');
        return
      }
      res.render('newpassword.html');
    }, (e) => {
      res.send('Unable to browse database');
    });
});


app.get('/', (req, res) => {
res.render('homepage.html');
});

app.get('/employees', (req, res) => {
res.setHeader('x-status', 'ok');
res.render('employees.html');
});

app.get('/dateback', (req, res) => {
res.setHeader('x-status', 'ok');
res.render('dateback.html');
});

app.get('/adduser', (req, res) => {
res.setHeader('x-status', 'ok');
res.render('adduser.html');
});

app.get('/userinfo', (req, res) => {
res.setHeader('x-status', 'ok');
res.render('userinfo.html');
});

app.post('/loginverify', (req, res) => {
  var loginData = {
    email: req.body.email,
    password: SHA256(req.body.pass).toString()
  };
  if (JSON.stringify(loginData) === JSON.stringify(ADMIN_LOGIN)) {
    res.cookie('token', tokenGenerate('admin', '', '', 'true'));
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
    res.cookie('token', tokenGenerate(doc.firstName, doc.lastName, doc.email, doc.role));
    res.setHeader('x-status', 'ok');
    res.send();
  }, (e) => {
    res.setHeader('x-status', 'Unable to browse database');
    res.send();
  });
});



app.post('/insertuser', (req, res) => {
if (verifyJWT(req.cookies.token).role === 'true') {
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
          res.setHeader('x-status', 'ok');
          res.send();
          let html = htmlEmailGenerate(`${process.env.PORT ? "https://" : "http://"}` + req.headers.host + '/newpassowrd?token=' + tokenGenerate(req.body.firstName, req.body.lastName, req.body.email, req.body.role));
          sendEmail('TOMKO', req.body.email, `Welcome on board ${req.body.firstName}!`, html);
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
      res.send();
    });
  } else {
    res.setHeader('x-status', 'you have no permissions');
    res.send();
  }
});


app.post('/addpassword', (req, res) => {
  var token = verifyJWT(req.headers.token);  //?? overenie druhý krát? prečo nie v app.use?
  if(!token){
    res.setHeader('x-status', 'Authentication failed');
    res.send();
    return;
  }
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
});

var lastRequest;

app.get('/lastRequest', (req, res) => {
  res.send(lastRequest);
});


app.post('/cardattached', (req, res) => {
    lastRequest = req;
  if (req.body.cardUID.length === 8) {
    accounts.findOne({
      cardUID: req.body.cardUID
    }).then((doc) => {
      if (!doc) {
        res.setHeader('x-status', 'could not find a user');
        res.send();
        return
      }
      var att = new attendance({
        user_id: doc._id,
        action: req.body.action,
        type: req.body.type,
        from: req.body.from,
        date: new Date(req.body.date*1000).toISOString()
      });
      att.save().then(() => {
        res.setHeader('x-status', 'ok');
        res.send();
      }, (e) => {
        res.setHeader('x-status', 'cannot instert document into attendance');
        res.send();
      });
    }, (e) => {
      res.setHeader('x-status', 'cannot browse accounts database');
      res.send();
    });
  } else {
    res.setHeader('x-status', 'invalid card ID');
    res.send();
  }
});


app.get('/getunixtime', (req, res) => {
  res.send('unixTime: ' + (Math.round(((new Date()).getTime()) / 1000)).toString());
});


app.get('/getattendance', (req, res) => {  // pridať http status kódy
  var season = req.headers.season.split('-');
  let startDate = new Date(season[0] + "/1/" + season[1] + " GMT-000");
  let endDate = new Date(season[0] + "/1/" + season[1] + " GMT-000");
  endDate.setMonth(endDate.getMonth() + 1);
  attendance.find({
    $and: [
      {
        user_id: req.headers.user_id
      }, {
        date: {
          $gte: startDate,
          $lt: endDate
        }
      }
    ]
  }, {
    _id: false,
    user_id: false
  }).then((doc) => {
    doc.sort((a, b) => {
      return (new Date(a.date)).getTime() - (new Date(b.date)).getTime();
    });
    res.setHeader('x-status', 'ok');
    res.send(doc);
  }, (e) => {
    res.setHeader('x-status', 'cannot browse accounts database');
    res.send();
  });
});


app.get('/getaccounts', (req, res) => {
  accounts.find({},{
    password: false
  }).then((doc) => {
    res.setHeader('x-status', 'ok');
    res.send(doc);
  }, (e) => {
    res.setHeader('x-status', 'cannot browse accounts database');
    res.send();
  });
});


app.post('/edituser', (req, res) => {
  accounts.findOneAndUpdate({
    _id: req.body._id
  }, {
    $set: {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      role: req.body.role,
      cardUID: req.body.cardUID
    }
  }).then((doc) => {
    res.setHeader('x-status', 'ok');
    res.status(200).send();
  }, (e) => {
    res.setHeader('x-status', 'cannot browse accounts database');
    res.status(503).send();
  });
});


app.listen(port);
