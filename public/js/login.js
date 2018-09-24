document.getElementById('login').onclick = function() {
  //swal('You have no acces with this entry','log err');

  var user = {
    name: document.getElementsByName('user')[0].value,
    pass: document.getElementsByName('pass')[0].value
  };

  var url = window.location.href;
  var URLarr = url.split("/");
  var postURL = URLarr[0] + '//' + URLarr[2] ;

  var userString = JSON.stringify(user);

  var xhr = new XMLHttpRequest();
  xhr.withCredentials = true;

  xhr.addEventListener("readystatechange", function() {
    if (this.readyState === 4) {
      var resObj = JSON.parse(xhr.response);

      if (resObj.status === 101) {
        document.getElementById("err_message").innerHTML = 'Invalid Name or Password';

      } else if (resObj.status === 100) {
        localStorage.setItem('token', resObj.token);
        window.location = postURL + '/logprogres.html';
      }
    }
  });

  xhr.open("POST", postURL + '/log');
  xhr.setRequestHeader("content-type", "application/json");
  xhr.setRequestHeader("cache-control", "no-cache");
  xhr.setRequestHeader("postman-token", "3192aa48-4e3d-721b-203c-09f2405e732e");

  xhr.send(userString);





  //localStorage.setItem('user', userString);

  // var name = document.getElementsByName('user')[0].value
  // var pass = document.getElementsByName('pass')[0].value
  // var xmlhttp = new XMLHttpRequest();   // new HttpRequest instance
  // xmlhttp.open("POST", "/log");
  // xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  // xmlhttp.send(JSON.stringify({ user: name, pass: pass }));


  // window.fetch('http://localhost:3000/log', {
  //
  //   method: "POST", // *GET, POST, PUT, DELETE, etc.
  //   mode: "cors", // no-cors, cors, *same-origin
  //   cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
  //   credentials: "same-origin", // include, same-origin, *omit
  //   headers: {
  //     "Content-Type": "application/json; charset=utf-8",
  //     // "Content-Type": "application/x-www-form-urlencoded",
  //   },
  //   redirect: "follow", // manual, *follow, error
  //   referrer: "no-referrer", // no-referrer, *client
  //   body: JSON.stringify(user), // body data type must match "Content-Type" header
  // }).then(resolve, reject);

  // console.log(body.url);
  // console.log(body.explanation);
};
