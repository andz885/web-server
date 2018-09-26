
var url = window.location.href;
var URLarr = url.split("/");
var postURL = URLarr[0] + '//' + URLarr[2] + '/tokenverify';
var data = {
  token: localStorage.getItem("token")
}
var xhr = new XMLHttpRequest();

xhr.withCredentials = true;
xhr.addEventListener("readystatechange", function() {
  if (this.readyState === 4) {
   var html = document.getElementById("html_id");
   html.innerHTML = xhr.response;
  }
});

xhr.open("POST", postURL);
xhr.setRequestHeader("content-type", "application/json");
xhr.setRequestHeader("cache-control", "no-cache");

xhr.send(JSON.stringify(data));




  //swal('You have no acces with this entry','log err');
//  <script src="https://unpkg.com/sweetalert/dist/sweetalert.min.js"></script>
// document.getElementById("iName").innerHTML  = userObj.name;
// document.getElementById("iPass").innerHTML  = userObj.pass;
