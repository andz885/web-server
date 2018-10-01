const express = require('express');
const port = process.env.PORT || 3000;
const MongoClient = require('mongodb').MongoClient;

var randomstring = require("randomstring");
var stringify = require('json-stringify-safe');
var fs = require('file-system');
var bodyParser = require('body-parser');
var app = express();
var mongoose = require('mongoose');
var {
  Schema
} = require('mongoose');

var key = {
  token: '',
  timeStamp: '',
  admin: false
};

app.set('view engine', 'html');
app.set('views', __dirname + '/public/html');
app.engine('html', require('ejs').renderFile);
app.use(express.static(__dirname + '/public/html'));
app.use(express.static(__dirname + '/public/css'));
app.use(express.static(__dirname + '/public/js'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => { //index rozstrelovacia stránka
  res.render('index.html');
});

app.post('/tokenverify', (req, res) => {
  var token = req.body.token;
  //overenie tokenu a expirácie
  if (token === key.token) {
    res.render('login_intro.html');
  } else {
    res.render('login.html');
  }
});

app.post('/loginverify', (req, res) => {
  var user = JSON.stringify(req.body);
  MongoClient.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/server',{useNewUrlParser: true}, (err, client) => {
    if (err) { // NOTE:Unable to connect Database
      res.send({
        status: 103
      });
      return
    }
    const db = client.db('server');
    db.collection('acc').findOne({user:user}, (err, result) => {
      if (err) { // NOTE:Unable to browse database
        res.send({
          status: 102
          error: err
        });
        return
      }
      if(!result){ // NOTE:Invadlid Username or Password
        res.send({
          status: 101
        });
        return
      }
      key.token = randomstring.generate();
      res.send({ // NOTE:user found, sending token
        status: 100,
        token: key.token
      });
    });
    client.close();
  });
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
