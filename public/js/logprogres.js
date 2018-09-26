var url = window.location.href;
var URLarr = url.split("/");
var postURL = URLarr[0] + '//' + URLarr[2];
var data = {
  token: localStorage.getItem("token")
}
var xhr = new XMLHttpRequest();

xhr.withCredentials = true;
xhr.addEventListener("readystatechange", function() {
  if (this.readyState === 4) {
    var status = xhr.getResponseHeader('status');
    if (status === '100') {
      var html = document.getElementById("html_id");
      html.innerHTML = xhr.response;
    } else if (status === '101') {
      var html = document.getElementById("html_id");
      html.innerHTML = xhr.response;
      console.log(xhr.response);
    } else if (status === '102') {
      window.location = postURL + '/login.html';
    }
  }
});

function myFunction() {
  document.getElementById("demo").innerHTML = "Hello World";
}

xhr.open("POST", postURL + '/tokenverify');
xhr.setRequestHeader("content-type", "application/json");
xhr.setRequestHeader("cache-control", "no-cache");

xhr.send(JSON.stringify(data));




//swal('You have no acces with this entry','log err');
//  <script src="https://unpkg.com/sweetalert/dist/sweetalert.min.js"></script>
// document.getElementById("iName").innerHTML  = userObj.name;
// document.getElementById("iPass").innerHTML  = userObj.pass;
