const express = require('express');
const hbs = require('hbs');
var stringify = require('json-stringify-safe');
var fs = require('file-system');
var bodyParser = require('body-parser');

const port = process.env.PORT || 3000;
var app = express();

hbs.registerPartials(__dirname + '/views/partials');
hbs.registerHelper('getCurrentYear', () => {
  return new Date().getFullYear();
});

hbs.registerHelper('screamIt', (text) => {
  return text.toUpperCase();
});

app.set('view engine', 'hbs');

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());


var token = '';

app.post('/log', (req, res) => {
  console.log(stringify(req.body));
  if (JSON.stringify(req.body) === '{"name":"xvalen22","pass":"123456"}') {
    token = Date.now();
    console.log(token);
    res.send({
      status: 100,
      token
    });
  } else {
    res.send({
      status: 101
    });
  }
});



app.post('/tokenverify', (req, res) => {
  if (Number(req.body.token) === token) {

    res.send('You are Welcome!');
  } else {
    res.send('You are not Welcome!');
  }

});


app.get('/', (req, res) => {
  res.render('home.hbs', {
    pageTitle: 'Hello Express',
    welcomeMessage: 'Welcome on my page!'
  });
});


app.get('/picture', (req, res) => {
  res.render('picture.hbs', {
    pageTitle: 'Some picture:'
  });
});

app.get('/login.html', (req, res) => {
  res.render('login.html');
});

app.listen(port);
