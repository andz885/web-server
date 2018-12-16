
var url = new URL(document.URL);
var xhr = new XMLHttpRequest();
xhr.withCredentials = true;
xhr.addEventListener("readystatechange", function() {
  if (this.readyState === 4) {
    let status = xhr.getResponseHeader('x-status');
    if (status === 'ok') {
      document.getElementById('fullAtt').innerHTML = xhr.response;
      localStorage.removeItem('season');
    } else {
      alert(status);
    }
  }
});
xhr.open("GET", postURL + "/getattendance");
xhr.setRequestHeader("content-type", "application/json");
xhr.setRequestHeader("cache-control", "no-cache");
xhr.setRequestHeader("user_id", localStorage.getItem('user_id'));
xhr.setRequestHeader("season", localStorage.getItem('season'));
xhr.send();
