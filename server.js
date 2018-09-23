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


app.post('/log', (req, res) => {
console.log(stringify(req.body));
if(JSON.stringify(req.body) === '{"name":"xvalen22","pass":"123456"}'){
  res.send('welcome');
}
else {
  res.send('you passed wrong login values');
}
});

app.get('/', (req, res) => {
  res.render('home.hbs', {
    pageTitle: 'Hello Express',
    welcomeMessage: 'Welcome on my page!'
  });
});

app.get('/about', (req, res) => {
  res.render('about.hbs', {
    pageTitle: 'About Page'
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
