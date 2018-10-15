//spustenie loginu aj enterom
document.getElementById("passwordEnter").addEventListener("keyup", function(event) {
  event.preventDefault();
  if (event.keyCode === 13) {
    document.getElementById("login").click();
  }
});

document.getElementById("emailEnter").addEventListener("keyup", function(event) {
  event.preventDefault();
  if (event.keyCode === 13) {
    document.getElementById("login").click();
  }
});

//po kliknutí na login
document.getElementById('login').onclick = function() {

  document.getElementById("err_message").innerHTML = ''; //vymazanie Invalid Username or Password

  var user = {
    email: document.getElementsByName('user')[0].value,
    pass: document.getElementsByName('pass')[0].value
  };
  var userString = JSON.stringify(user);

  var URLarr = window.location.href.split("/");
  var postURL = URLarr[0] + '//' + URLarr[2];

  var xhr = new XMLHttpRequest();
  xhr.withCredentials = true;

  xhr.addEventListener("readystatechange", function() {
    if (this.readyState === 4) {
      var status = xhr.getResponseHeader('x-status');
      if (status === 'ok') {
        localStorage.setItem('token', xhr.getResponseHeader('token'));
        localStorage.setItem('login_intro', 'true');
        window.location = postURL;
      } else {
        document.getElementById("err_message").classList.toggle("classTwo");
        document.getElementById("err_message").innerHTML = status;
      }
    }
  });

  xhr.open("POST", postURL + '/loginverify');
  xhr.setRequestHeader("content-type", "application/json");
  xhr.setRequestHeader("cache-control", "no-cache");

  xhr.send(userString);

};



//localStorage.setItem('user', userString);

// var name = document.getElementsByName('user')[0].value
// var pass = document.getElementsByName('pass')[0].value
// var xmlhttp = new XMLHttpRequest();   // new HttpRequest instance
// xmlhttp.open("POST", "/log");
// xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
// xmlhttp.send(JSON.stringify({ user: name, pass: pass }));


// window.fetch('http://localhost:3000/log', {
//
//   method: "POST", // *GET, POST, PUT, DELETE, etc.
//   mode: "cors", // no-cors, cors, *same-origin
//   cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
//   credentials: "same-origin", // include, same-origin, *omit
//   headers: {
//     "Content-Type": "application/json; charset=utf-8",
//     // "Content-Type": "application/x-www-form-urlencoded",
//   },
//   redirect: "follow", // manual, *follow, error
//   referrer: "no-referrer", // no-referrer, *client
//   body: JSON.stringify(user), // body data type must match "Content-Type" header
// }).then(resolve, reject);

// console.log(body.url);
// console.log(body.explanation);
