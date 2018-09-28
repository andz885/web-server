const express = require('express');
const port = process.env.PORT || 3000;

var randomstring = require("randomstring");
var stringify = require('json-stringify-safe');
var fs = require('file-system');
var bodyParser = require('body-parser');
var app = express();

var key = {
  token: '',
  timeStamp : '',
  admin : false
};

app.set('view engine', 'html');
app.set('views', __dirname + '/public/html');
app.engine('html', require('ejs').renderFile);
app.use(express.static(__dirname + '/public/html'));
app.use(express.static(__dirname + '/public/css'));
app.use(express.static(__dirname + '/public/js'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());



app.post('/log', (req, res) => {
    function dbRequest (){  //hladanie req.body v databáze, databáza vracia key object s parametrom admin
    if(JSON.stringify(req.body) === '{"name":"xvalen22","pass":"123456"}'){
      return { admin: true};
    }
  }
  var objFromBD = dbRequest();
  if (objFromBD) { //ak je meno a heslo v databáze
    key.token = randomstring.generate();
    key.timeStamp = Date.now();
    key.admin = objFromBD.admin;
    // uloženie objeku key do DB
    res.send({
      status: 100,
      token: key.token
    });
  } else { //ak nieje meno a heslo v databáze
    res.send({
      status: 101
    });
  }
});

app.get('/logprogres', (req, res) => {
  var token = req.param('token');
  //hladanie tokenu v db
  if(token === key.token){
    res.render('login_intro.html');
  } else {
    res.render('login.html');
  }

});


app.listen(port);

//req.headers.login_intro
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
