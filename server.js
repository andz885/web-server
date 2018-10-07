const express = require('express');
const port = process.env.PORT || 3000;
const validator = require('validator');
const SHA256 = require('crypto-js').SHA256;
const jwt = require('jsonwebtoken');
const SECRET = 'k^p^Fc-Cw$dd#S]';
const ADMIN = {
  email: 'admin',
  password: SHA256('smrecany1265').toString()
}

var randomstring = require("randomstring");
var bodyParser = require('body-parser');
var app = express();
var mongoose = require('mongoose');

var accountSchema = new mongoose.Schema({
  loginData: String,
  role: String,
  cardUID: String
}, {
  versionKey: false,
  collection: 'accounts'
});
var accounts = mongoose.model('accounts',accountSchema);

var attendanceSchema = new mongoose.Schema({
  user_id: String,
  action: String,
  time: String
}, {
  versionKey: false,
  collection: 'attendances'
});
var attendance = mongoose.model('attendances',attendanceSchema);

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/TomkoDB',{useNewUrlParser: true});

app.set('view engine', 'html');
app.set('views', __dirname + '/public/html');
app.engine('html', require('ejs').renderFile);
app.use(express.static(__dirname + '/public/css'));
app.use(express.static(__dirname + '/public/js'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

function verifyJWT(token) {
  var result;
  jwt.verify(token, SECRET, function(err, payload) {
    if (err) {
      result = null;
    }else{
      result = payload;
    }
  });
  return result;
}

app.get('*', (req, res) => { //index rozstrelovacia stránka
  var token = verifyJWT(req.headers.token);
  if(!token){
      res.render('form.html');
  }else {
    var id = req.params[0].replace('/','') + '.html';
    res.setHeader('status', 'ok');
    res.render(id);
  }

});


app.post('/form', (req, res) => {
var token = verifyJWT(req.body.token);
if(!token){
    res.render('login.html');
    return
}else {
  res.render('homepage.html');
}
});


app.post('/loginverify', (req, res) => {
  var loginData = {
    email: req.body.email,
    password: SHA256(req.body.pass).toString()
  };
  console.log(loginData);
  if(loginData.toString() === ADMIN.toString()){
    res.send({status: 100, token: jwt.sign({
        id: 'admin',
        firstName: 'Admin',
        secondName: '',
        role: 'admin'
      }, SECRET).toString()
    });
    return
  }
  accounts.findOne(loginData).then((doc) => {
    if (!doc) {
      return res.send({status: 101});
    }
    res.send({status: 100, token: jwt.sign({
        id: doc._id,
        firstName: doc.firstName,
        secondName: doc.secondName,
        role: doc.role
      }, SECRET).toString()
    });
  }, (e) => {res.send({status: 102});
  });
});

app.post('/adduser', (req,res) => {

})


app.post('/cardattached', (req, res) => {
  if(req.body.cardUID.length === 8){
    accounts.findOne({cardUID : req.body.cardUID}).then((doc) => {
      if(!doc){
        return res.send('could not find a user');
      }
      var att = new attendance({
        user_id: doc._id,
        action: req.body.action,
        time: req.body.time
      });
      att.save().then(() => {
        res.send('document inserted');
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

//req.headers.login_intro
//app.set('view engine', 'ejs');
// app.set('view engine', 'hbs');



// MongoClient.connect('mongodb://localhost:27017/server', (err, client) => {
//   if (err) {
//     return console.log('Unable to connect to MongoDB server')
//   }
//   console.log('Connected to MongoDB server');
//   const db = client.db('server');
//
//   db.collection('acc').insertOne({
//     user: '{"name":"xvalen22","pass":"123456"}',
//     permissions: 'admin',
//     since: new Date
//   }, (err, result) => {
//     if (err) {
//       return console.log('Unable to insert todo', err);
//     }
//
//     console.log(JSON.stringify(result.ops, undefined, 2));
//   });
//   client.close();
// });

// hbs.registerPartials(__dirname + '/views/partials');
// hbs.registerHelper('getCurrentYear', () => {
//   return new Date().getFullYear();
// });
//
// hbs.registerHelper('screamIt', (text) => {
//   return text.toUpperCase();
// });
//
// app.get('/', (req, res) => {
//   res.render('home.hbs', {
//     pageTitle: 'Hello Express',
//     welcomeMessage: 'Welcome on my page!'
//   });
// });
//
// app.get('/picture', (req, res) => {
//   res.render('picture.hbs', {
//     pageTitle: 'Some picture:'
//   });
// });
//
// app.get('/login.html', (req, res) => {
//   res.render('login.html');
// });




// app.post('/tokenverify', (req, res) => {
//   if (Number(req.body.token) === key.token) { // je prijatý token v databáze tokenov?
//     if (key.reqSign === false) {
//       console.log('case 100');
//       key.reqSign = true;
//       res.header({status: 100});
//       res.render('attendance.html');
//     } else {
//       console.log('case 101');
//       res.header({status: 101});
//       res.render('attendance.html');
//     }
//   } else {
//     console.log('case 102');
//     res.header({status: 102});
//     res.send('');
//   }
// });
