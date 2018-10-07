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

//name update from token
var token = localStorage.getItem("token");
if (token) {
  var base64Url = token.split('.')[1];
  var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  var payload = JSON.parse(window.atob(base64));
  document.getElementsByClassName("name")[0].innerHTML = payload.firstName + ' ' + payload.secondName;
}

function askForContent(tabName) {
  var URLarr = window.location.href.split("/");
  var postURL = URLarr[0] + '//' + URLarr[2];

  var xhr = new XMLHttpRequest();
  xhr.withCredentials = true;

  xhr.addEventListener("readystatechange", function() {
    if (this.readyState === 4) {
      var status = xhr.getResponseHeader('status');
      if (status === 'ok') {
        document.getElementById('content').innerHTML = xhr.response;
      } else {
        document.removeChild(document.documentElement);
        document.write(xhr.response);
        document.close();
      }
    }
  });

  xhr.open("GET", postURL + '/' + tabName);
  xhr.setRequestHeader("content-type", "application/json");
  xhr.setRequestHeader("cache-control", "no-cache");
  xhr.setRequestHeader("token", token);

  xhr.send();
}

document.getElementById('addUser').onclick = () => {
  askForContent('addUser');
}
