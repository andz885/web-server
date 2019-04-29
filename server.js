//nodejs HTTP server

require('dotenv').config({path: __dirname + '/process.env'});
const https = require('https');
const http = require('http');
const express = require('express');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const EMAIL_HTML = '<div style="text-align:center; margin-top:30px; margin-bottom:0px;"><a style="background:#3C5D6E; font-family:sans-serif; text-decoration:none; font-size:16px; color:white; padding:10px 15px; border-radius:2px;" <placeForURI> target="_blank">Click Here</a></div><div style="margin:20px auto; font-family:system-ui; font-weight:100; font-size:20px; text-align:center;">to create your new password</div>';
const SHA256 = require('crypto-js').SHA256;
const http_port = process.env.HTTP_PORT;
const https_port = process.env.HTTPS_PORT;
const SECRET = process.env.SECRET;
const MCU_KEY = process.env.MCU_KEY;
const ADMIN_LOGIN = process.env.ADMIN_LOGIN;
const ADMIN_ID = process.env.ADMIN_DB_ID;

var stringify = require('json-stringify-safe');
var cookieParser = require('cookie-parser');
var randomstring = require("randomstring");
var bodyParser = require('body-parser');
var fs = require('fs');
var app = express();
var mongoose = require('mongoose');
var favicon = require('serve-favicon');
var nodemailer = require('nodemailer');
var enforce = require('express-sslify');
var transporter = nodemailer.createTransport({
  host: 'smtp.zoho.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD
  },
});

var accountSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  password: String,
  role: String,
  cardUID: String,
  settings: Object
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
mongoose.connect(process.env.MONGODB_URI, {useNewUrlParser: true});

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

app.use(enforce.HTTPS({trustProtoHeader: true}));
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
    res.cookie('token', tokenGenerate(token.firstName, token.lastName, token.email, token.role, token._id));
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

function tokenGenerate(firstName, lastName, email, role, _id) {
  return jwt.sign({
    firstName,
    lastName,
    email,
    role,
    _id
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
  if (req.body.email + ' ' + loginData.password === ADMIN_LOGIN) {
    accounts.findByIdAndUpdate(ADMIN_ID, {
      $setOnInsert: {
        firstName: 'admin',
        role: true,
        settings: {
          arrivalSwitch: true,
          arrivalFromHours: 7,
          arrivalFromMinutes: 0,
          arrivalToHours: 10,
          arrivalToMinutes: 0,
          MWTSwitch: true,
          MWTHours: 8,
          MWTMinutes: 0,
          img: 'default.svg'
        }
      }
    }, {
      new: true, // return new doc if one is upserted
      upsert: true // insert the document if it does not exist
    }).then(() => {}, (e) => {
      console.log(e);
    });
    res.cookie('token', tokenGenerate('admin', '', '', 'true', ADMIN_ID));
    res.setHeader('x-status', 'ok');
    res.send();
    return;
  }
  accounts.findOne(loginData).then((doc) => {
    if (!doc) {
      res.setHeader('x-status', 'Invalid Name or Password');
      res.send();
      return
    }
    res.cookie('token', tokenGenerate(doc.firstName, doc.lastName, doc.email, doc.role, doc._id));
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
          role: req.body.role,
          settings: {
          arrivalSwitch: true,
          arrivalFromHours: 7,
          arrivalFromMinutes: 0,
          arrivalToHours: 10,
          arrivalToMinutes: 0,
          MWTSwitch: true,
          MWTHours: 8,
          MWTMinutes: 0,
          img: 'default.svg'
          }
        });
        acc.save().then((savedDoc) => {
          console.log(savedDoc);
          res.setHeader('x-status', 'ok');
          res.send();
          let html = htmlEmailGenerate("https://" + req.headers.host + '/newpassowrd?token=' + tokenGenerate(req.body.firstName, req.body.lastName, req.body.email, req.body.role, savedDoc._id));
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

var lastRequest;                                        //------------------------------------------------------
app.get('/lastRequest', (req, res) => {                 //------------------------------------------------------
  res.send(lastRequest);                                //------------------------------------------------------
});                                                     //------------------------------------------------------



app.post('/cardattached', (req, res) => {
  if (req.body.cardUID.length === 8) {
    accounts.findOne({cardUID: req.body.cardUID}).then((doc) => {
      if (!doc) {
        res.setHeader('x-status', 'could not find a user');
        res.send();
        return;
      }
        attendance.findOne({user_id: doc._id}).sort({date:-1}).then((doc2) => {
          lastRequest = doc2;         //-------------------------------------------------------------------------------------------
          if(doc2 != null && doc2.action === req.body.action && req.body.from === 'user' && req.body.force == false){
            res.setHeader('x-status', 'repeated record');
            res.send();
            return;
          }
          if(req.body.date * 1000 < ((new Date()).getTime() - 60000) && req.body.from === 'user'){
            res.setHeader('x-status', 'unactual time');
            res.send();
            return;
          }
          var att = new attendance({
            user_id: doc._id,
            action: req.body.action,
            type: req.body.type,
            from: req.body.from,
            date: new Date(req.body.date * 1000).toISOString()
          });
          att.save().then(() => {
            res.setHeader('x-status', 'ok');
            res.send();
          }, (e) => {
            res.setHeader('x-status', 'cannot instert document into attendance');
            res.send();
          });
        }, (e) =>{
          res.setHeader('x-status', 'cannot browse attendance database');
          res.send();
          return;
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


app.post('/calendarsettings', (req, res) => {
  accounts.findOneAndUpdate({
    _id: req.body._id
  }, {
    $set: {
      'settings.arrivalSwitch': req.body.arrivalSwitch,
      'settings.arrivalFromHours': req.body.arrivalFromHours,
      'settings.arrivalFromMinutes': req.body.arrivalFromMinutes,
      'settings.arrivalToHours': req.body.arrivalToHours,
      'settings.arrivalToMinutes': req.body.arrivalToMinutes,
      'settings.MWTSwitch': req.body.MWTSwitch,
      'settings.MWTHours': req.body.MWTHours,
      'settings.MWTMinutes': req.body.MWTMinutes
    }
  }).then((doc) => {
    if (!doc) {
      res.setHeader('x-status', 'your account was not found in dabatase');
      res.status(200).send();
    } else {
      res.setHeader('x-status', 'ok');
      res.status(200).send();
    }
  }, (e) => {
    res.setHeader('x-status', 'cannot browse accounts database');
    res.status(503).send();
  });
});


app.get('/getunixtime', (req, res) => {
  res.send('unixTime: ' + (Math.round(((new Date()).getTime()) / 1000)).toString());
});


app.get('/getattendance', (req, res) => {  // pridať http status kódy
  let season = req.headers.season.split('-');
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
  accounts.find({
    _id: { $ne: ADMIN_ID }},{
    password: false,
    settings: false
  }).then((doc) => {
    res.setHeader('x-status', 'ok');
    res.send(doc);
  }, (e) => {
    res.setHeader('x-status', 'cannot browse accounts database');
    res.send();
  });
});


  app.get('/getuserobject', (req, res) => {
    accounts.findById(req.headers._id,{
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
    if (!doc) {
      res.setHeader('x-status', 'user not found in database');
      res.status(200).send();
    } else {
      res.setHeader('x-status', 'ok');
      res.status(200).send();
    }
  }, (e) => {
    res.setHeader('x-status', 'cannot browse accounts database');
    res.status(503).send();
  });
});

http.createServer((req, res) => {
  res.writeHead(301, {
    "Location": "https://" + req.headers['host'].replace(http_port, https_port) + req.url
  });
  res.end();
}).listen(http_port, () => {
  console.log(`HTTP server is running at port ${http_port}`);
});


https.createServer({
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.cert')
}, app).listen(https_port, () => {
  console.log(`HTTPS server is running at port ${https_port}`);
});
