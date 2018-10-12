const LOGINTIME = 32400000; // 9 hours in milisecons after which will be user automaticly logged out
var URLarr = window.location.href.split("/");
var postURL = URLarr[0] + '//' + URLarr[2];
var logOutTimer;

if (localStorage.getItem("login_intro") === 'true') {
  localStorage.removeItem('login_intro');
  setTimeout(() => {
    document.getElementById("delete").classList.remove("content-hidden");
    setTimeout(() => {
      document.onclick = () => {
        document.getElementById("delete").remove();
        document.onclick = () => {};
      }
    }, 2500)
  }, 350);
} else {
  document.getElementById("delete").remove();
}


//name update from inside of token
function updateUserName() {
  var token = localStorage.getItem("token");
  if (token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var payload = JSON.parse(window.atob(base64));
    document.getElementsByClassName("name")[0].innerHTML = payload.firstName + ' ' + payload.secondName;
  }
}

//asking for new token from server and updating the old one after recive
function refreshLogOutTimer() {
  var token = localStorage.getItem("token");
  var xhr = new XMLHttpRequest();
  xhr.withCredentials = true;

  xhr.addEventListener("readystatechange", function() {
    if (this.readyState === 4) {
      var status = xhr.getResponseHeader('status');
      if (status === 'ok') {
        var resObj = JSON.parse(xhr.response);
        localStorage.setItem('token', resObj.token);
      } else {
        localStorage.removeItem('token');
        window.location = postURL;
      }
    }
  });

  xhr.open("POST", postURL + '/refreshtoken');
  xhr.setRequestHeader("content-type", "application/json");
  xhr.setRequestHeader("cache-control", "no-cache");
  xhr.send(JSON.stringify({token}));

  clearTimeout(logOutTimer);
  logOutTimer = setTimeout(() => {
    localStorage.removeItem('token');
    window.location = postURL;
  }, LOGINTIME);
}

//loading content script
function loadScript(url, callback) {
  var script = document.createElement("script")
  script.type = "text/javascript";

  if (script.readyState) { //IE
    script.onreadystatechange = function() {
      if (script.readyState == "loaded" ||
        script.readyState == "complete") {
        script.onreadystatechange = null;
        callback();
      }
    };
  } else { //Others
    script.onload = function() {
      callback();
    };
  }

  script.src = url;
  document.getElementsByTagName("head")[0].appendChild(script);
}

//updating content after clicking on one of the tab buttons
function askForContent(tabName) {
  var token = localStorage.getItem("token");
  var xhr = new XMLHttpRequest();
  xhr.withCredentials = true;

  xhr.addEventListener("readystatechange", function() {
    if (this.readyState === 4) {
      var status = xhr.getResponseHeader('status');
      if (status === 'ok') {
        document.getElementById('content').innerHTML = xhr.response;
        loadScript('/' + tabName + '.js', () => {});
      } else {
        localStorage.removeItem('token');
        window.location = postURL;
      }
    }
  });

  xhr.open("GET", postURL + '/' + tabName);
  xhr.setRequestHeader("content-type", "application/json");
  xhr.setRequestHeader("cache-control", "no-cache");
  xhr.setRequestHeader("token", token);

  xhr.send();
}

//Log Out button
document.getElementsByClassName('stripRight')[0].onclick = () => {
  localStorage.removeItem('token');
  window.location = postURL;
}

//Add User tab button
document.getElementById('addUser').onclick = () => {
  askForContent('addUser');
  refreshLogOutTimer();
}

updateUserName();
refreshLogOutTimer();
