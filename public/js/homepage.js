var URLarr = window.location.href.split("/");
var postURL = URLarr[0] + '//' + URLarr[2];
var loggedUserObject;

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


//update name img and loggedUserObject
function updateUserPref(callback) {
  var token = getCookie("token");
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var payload = decodeURIComponent(Array.prototype.map.call(atob(base64), function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    }).join(''));
    var decodedPayload = JSON.parse(payload);
    document.getElementsByClassName("name")[0].innerHTML = decodedPayload.firstName + ' ' + decodedPayload.lastName;

    var xhr = new XMLHttpRequest();
    xhr.withCredentials = true;
    xhr.addEventListener("readystatechange", function() {
      if (this.readyState === 4) {
        var status = xhr.getResponseHeader('x-status');
        if (status === 'ok') {
          loggedUserObject = JSON.parse(xhr.response);
          document.getElementById('avatar').src = loggedUserObject.img;
          document.getElementById('avatar').style.display = 'block';
          callback();
        } else {
          console.log(status);
        }
      }
    });

    xhr.open("GET", postURL + "/getuserobject");
    xhr.setRequestHeader("_id", decodedPayload._id);
    xhr.setRequestHeader("content-type", "application/json");
    xhr.setRequestHeader("cache-control", "no-cache");
    xhr.send();
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

//first letter from string to upper case
function firstLetterToUpperCase(string) {
  if (string) return string[0].toUpperCase() + string.substring(1);
}
//email validation
function isValidEmail(email) {
  var atpos = email.indexOf("@");
  var dotpos = email.lastIndexOf(".");
  if (atpos < 1 || dotpos < atpos + 2 || dotpos + 2 >= email.length) {
    return false;
  }
  return true;
}
//name validation
function isValidName(string) {
  if (!string) return false;
  if ((string.length < 3) || (string.length > 20)) return false;
  var slovakAlphabet = 'aáäbcčdďeéfghiíjklĺľmnňoóôpqrŕsštťuúvwxyýzž';
  for (var i = 0; i < string.length; i++) {
    var found = false;
    for (var d = 0; d < slovakAlphabet.length; d++) {
      if (string[i] === slovakAlphabet[d] || string[i] === slovakAlphabet[d].toUpperCase()) {
        found = true;
        break
      };
    }
    if (found === false) return false;
  }
  return true;
}
//card id validation
function isValidCardUID(string) {
  if (string.length !== 8) return false;
  var asciiNumb;
  for (var i = 0; i < 8; i++) {
    asciiNumb = string.charCodeAt(i);
    if (asciiNumb < 48 || asciiNumb > 70 || (asciiNumb > 57 && asciiNumb < 65)) return false;
  }
  return true;
}

function showShadow() {
document.getElementById('content').insertAdjacentHTML('beforeend', '<div id="contentShadow" class="contentShadow"></div>');
document.getElementById('contentShadow').onclick = function () {
document.getElementById('contentShadow').remove();
for (let x = 0; x < document.getElementsByClassName('beforeShadow').length; x++) { //hide all elements with beforeShadow class
  document.getElementsByClassName('beforeShadow')[x].style.display = 'none';
}
}
}

//refresh page by clicking on TOMKO
document.getElementById('logo').onclick = () => {
  window.location = postURL;
}

document.getElementById('burger-menu').onclick = () => {
  if (parseInt(document.getElementById('left-menu').style.height) === 0) {
    document.getElementById('left-menu').style.height = 'calc(100% - 45px)';
    document.getElementById('closeLeftMenu').style.display = 'unset';
  } else {
    document.getElementById('left-menu').style.height = '0px';
    document.getElementById('closeLeftMenu').style.display = 'none';
  }
}

function hideBurgerMenu() {
  document.getElementById('left-menu').style.height = '0px';
  document.getElementById('closeLeftMenu').style.display = 'none';
}

//Log Out button function
document.getElementsByClassName('stripRight')[0].onclick = () => {
  document.cookie = "token=";
  window.location = postURL;
}

//Overview tab button
document.getElementById('overview').onclick = () => {
  askForContent('overview');
  hideBurgerMenu();
}

//Show employees table tab button
document.getElementById('employees').onclick = () => {
  askForContent('employees');
  hideBurgerMenu();
}

//Add User tab button
document.getElementById('addUser').onclick = () => {
  askForContent('adduser');
  hideBurgerMenu();
}

//Settings tab button
document.getElementById('settings').onclick = () => {
  askForContent('settings');
  hideBurgerMenu();
}

//hide left-menu (burger menu) when by clicking away
document.getElementById('closeLeftMenu').onclick = () => {
  hideBurgerMenu();
}

updateUserPref(() => {
  document.getElementById('overview').click();
});
