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
    var payload = decodeURIComponent(Array.prototype.map.call(atob(base64), function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    }).join(''));
    var decodedPayload = JSON.parse(payload);
    document.getElementsByClassName("name")[0].innerHTML = decodedPayload.firstName + ' ' + decodedPayload.lastName;
  }
}

//asking for new token from server and updating the old one after recive
function refreshLogOutTimer() {
  var token = localStorage.getItem("token");
  var xhr = new XMLHttpRequest();
  xhr.withCredentials = true;

  xhr.addEventListener("readystatechange", function() {
    if (this.readyState === 4) {
      var status = xhr.getResponseHeader('x-status');
      if (status === 'ok') {
        localStorage.setItem('token', xhr.getResponseHeader('token'));
      } else {
        localStorage.removeItem('token');
        window.location = postURL;
      }
    }
  });

  xhr.open("POST", postURL + '/refreshtoken');
  xhr.setRequestHeader("content-type", "application/json");
  xhr.setRequestHeader("cache-control", "no-cache");
  xhr.send(JSON.stringify({
    token
  }));

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
      var status = xhr.getResponseHeader('x-status');
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
//refresh page by clicking on TOMKO
document.getElementsByClassName('logo')[0].onclick = () => {
  window.location = postURL;
}

//Log Out button function
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
