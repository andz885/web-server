//spustenie loginu aj enterom z password inputu
document.getElementById("passwordEnter").addEventListener("keyup", function(event) {
  event.preventDefault();
  if (event.keyCode === 13) {
    document.getElementById("login").click();
  }
});
//spustenie loginu aj enterom z email inputu
document.getElementById("emailEnter").addEventListener("keyup", function(event) {
  event.preventDefault();
  if (event.keyCode === 13) {
    document.getElementById("login").click();
  }
});
//po kliknutí na login
document.getElementById('login').onclick = function() {
  document.getElementById("err-span").style.transition = 'opacity 0s';
  document.getElementById("err_message").innerHTML = ''; //vymazanie Invalid Username or Password
  document.getElementById("err-span").style.opacity = '0';
  var userString = JSON.stringify({
    email: document.getElementsByName('user')[0].value,
    pass: document.getElementsByName('pass')[0].value
  });
  var URLarr = window.location.href.split("/");
  var postURL = URLarr[0] + '//' + URLarr[2];
  var xhr = new XMLHttpRequest();
  xhr.withCredentials = true;
  xhr.addEventListener("readystatechange", function() {
    if (this.readyState === 4) {
      var status = xhr.getResponseHeader('x-status');
      if (status === 'ok') {
        window.location = postURL;
      } else {
        document.getElementById("err-span").style.transition = 'opacity 0.6s';
        document.getElementById("err_message").innerHTML = status;
        document.getElementById("err-span").style.opacity = '1';
      }
    }
  });
  xhr.open("POST", postURL + '/loginverify');
  xhr.setRequestHeader("content-type", "application/json");
  xhr.setRequestHeader("cache-control", "no-cache");
  xhr.send(userString);
};
