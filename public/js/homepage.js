var URLarr = window.location.href.split("/");
var postURL = URLarr[0] + '//' + URLarr[2];

//login intro
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

//function to get cookie value
function getCookie(cookieName)
{
    var i,x,y,ARRcookies=document.cookie.split(";");

    for (i=0;i<ARRcookies.length;i++)
    {
        x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
        y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
        x=x.replace(/^\s+|\s+$/g,"");
        if (x==cookieName)
        {
            return unescape(y);
        }
     }
}

//update name from token
function updateUserName() {
  var token = getCookie("token");
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
  var elem = document.getElementById('temp');
  if (elem) elem.parentNode.removeChild(elem);
  script.src = url;
  script.id = 'temp';
  document.getElementsByTagName("head")[0].appendChild(script);
}

//updating content after clicking on one of the tab buttons
function askForContent(tabName) {
  var xhr = new XMLHttpRequest();
  xhr.withCredentials = true;

  xhr.addEventListener("readystatechange", function() {
    if (this.readyState === 4) {
      var status = xhr.getResponseHeader('x-status');
      if (status === 'ok') {
        document.getElementById('content').innerHTML = xhr.response;
        loadScript('/' + tabName + '.js', () => {});
      } else {
        window.location = postURL;
      }
    }
  });

  xhr.open("GET", postURL + '/' + tabName);
  xhr.setRequestHeader("content-type", "application/json");
  xhr.setRequestHeader("cache-control", "no-cache");
  xhr.send();
}

//refresh page by clicking on TOMKO
document.getElementsByClassName('logo')[0].onclick = () => {
  window.location = postURL;
}

//Log Out button function
document.getElementsByClassName('stripRight')[0].onclick = () => {
  document.cookie = "token=";
  window.location = postURL;
}

document.getElementById('employees').onclick = () => {
  askForContent('employees');
}

document.getElementById('dateBack').onclick = () => {
  askForContent('dateback');
}
//Add User tab button
document.getElementById('addUser').onclick = () => {
  askForContent('adduser');
}

updateUserName();
