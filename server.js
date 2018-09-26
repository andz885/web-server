const express = require('express');
const port = process.env.PORT || 3000;

var stringify = require('json-stringify-safe');
var fs = require('file-system');
var bodyParser = require('body-parser');
var app = express();
var key = { token: '', reqSign: false };

app.set('views', __dirname + '/public/html');
app.engine('html', require('ejs').renderFile);
app.use(express.static(__dirname + '/public/html'));
app.use(express.static(__dirname + '/public/css'));
app.use(express.static(__dirname + '/public/js'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());



app.post('/log', (req, res) => {
  if (JSON.stringify(req.body) === '{"name":"xvalen22","pass":"123456"}') {
    key.token = Date.now();
    res.send({ //správne meno a heslo, odosielam token
      status: 100,
      token: key.token
    });
  } else {
    res.send({ //nesprávne heslo
      status: 101
    });
  }
});


app.post('/tokenverify', (req, res) => {
  if (Number(req.body.token) === key.token) { // je prijatý token v databáze tokenov?
    if (key.reqSign === false) {
      key.reqSign = true;
      res.send({
        status: 100,
        message: 'For the first time'
      });
    } else {
      res.send({
        status: 100,
        message: 'You are still singed in'
      });
    }
  } else {
    res.redirect('login.html');
  }
});


app.listen(port);


//app.set('view engine', 'ejs');
// app.set('view engine', 'hbs');

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
