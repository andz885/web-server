const express = require('express');
const port = process.env.PORT || 3000;
const validator = require('validator');
const SHA256 = require('crypto-js').SHA256;
const jwt = require('jsonwebtoken');
const EMAILNAME = 'servise.operator@vymyslenyemail.com';
const EMAILPASS = 'jahoda123';
const SECRET = 'k^p^Fc-Cw$dd#S]';
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

// let transporter = nodemailer.createTransport({
//   host: 'in-v3.mailjet.com',
//   port: 587,
//   secure: false,
//   auth: {
//     user: 'b66cfbf034498263ccab08af85a92075', // generated ethereal user
//     pass: '43509372fea78b695a6d618578692314' // generated ethereal password
//   },
//   // tls: {
//   //   rejectUnauthorized: false
//   // }
// });
//
// let mailOptions = {
//   from: EMAILNAME, // sender address
//   to: 'ing.adam.valent@gmail.com', // list of receivers
//   subject: 'Hello', // Subject line
//   text: 'Hello world?', // plain text body
//   html: '<b>Hello world?</b>' // html body
// };
//
// transporter.sendMail(mailOptions, (error, info) => {
//   if (error) {
//     return console.log(error);
//   }
// });

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

app.set('view engine', 'html');
app.set('views', __dirname + '/public/html');
app.engine('html', require('ejs').renderFile);
app.use(express.static(__dirname + '/public/css'));
app.use(express.static(__dirname + '/public/js'));
app.use(express.static(__dirname + '/public/images'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(favicon(__dirname + '/public/images/favicon.ico'));

function tokenGenerate(firstName, lastName, role) {
  return jwt.sign({
    firstName,
    lastName,
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
    res.setHeader('token', tokenGenerate(token.firstName, token.lastName, token.role));
    res.send();
  }
});

app.get('*', (req, res) => { //index rozstrelovacia stránka
  var token = verifyJWT(req.headers.token);
  if (!token) {
    res.render('form.html');
  } else {
    var tabPage = req.params[0].replace('/', '') + '.html';
    res.setHeader('x-status', 'ok');
    res.render(tabPage);
  }

});

app.post('/form', (req, res) => {
  var token = verifyJWT(req.body.token);
  if (!token) {
    res.render('login.html');
    return
  } else {
    res.render('homepage.html');
  }
});


app.post('/loginverify', (req, res) => {
  var loginData = {
    email: req.body.email,
    password: SHA256(req.body.pass).toString()
  };
  if (JSON.stringify(loginData) === JSON.stringify(ADMIN)) {
    res.setHeader('token', tokenGenerate('admin', '', 'admin'));
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
    res.setHeader('token', tokenGenerate(doc.firstName, doc.lastName, doc.role));
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
  } else if (token.role === 'admin') {
    var acc = new accounts({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      cardUID: req.body.cardUID,
      password: 'undefined'
    });
    acc.save().then(() => {
      res.setHeader('x-status', 'ok');
      res.send();
    }, (e) => {
      res.setHeader('x-status', 'cannot add new user');
      res.send();
    });
  } else {
    res.setHeader('x-status', 'you have no permissions');
    res.send();
  }
})


app.post('/cardattached', (req, res) => {
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
