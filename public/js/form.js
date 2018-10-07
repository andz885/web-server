
var url = window.location.href;
var URLarr = url.split("/");
var postURL = URLarr[0] + '//' + URLarr[2];

var token = JSON.stringify( {token : localStorage.getItem("token")});

var xhr = new XMLHttpRequest();
xhr.withCredentials = true;

xhr.addEventListener("readystatechange", function() {
  if (this.readyState === 4) {
    document.removeChild(document.documentElement);
    document.write(xhr.response);
    document.close();
  }
});

xhr.open("POST", postURL + '/form');
xhr.setRequestHeader("content-type", "application/json");
xhr.setRequestHeader("cache-control", "no-cache");

xhr.send(token);
