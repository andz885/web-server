//enabling adding user via enter from all <inputs>
() => {
  inputsIds = ["firstName", "lastName", "email", "cardUID"];
  for (var i = 0; i < 4; i++) {
    document.getElementById(inputsIds[i]).addEventListener("keyup", function(event) {
      event.preventDefault();
      if (event.keyCode === 13) {
        document.getElementsByClassName("addButton")[0].click();
      }
    });
  }
}
//funkcia ktorá sa vykoná po stlačení tlačida sumbit
document.getElementsByClassName('addButton')[0].onclick = function() {
  document.getElementById('statusDiv').innerHTML = '';
  document.getElementById("statusDiv").classList.remove("fadeClass");

  var objToSend = {
    firstName: firstLetterToUpperCase(document.getElementById('firstName').value.trim()),
    lastName: firstLetterToUpperCase(document.getElementById('lastName').value.trim()),
    email: document.getElementById('email').value,
    cardUID: document.getElementById('cardUID').value.toUpperCase(),
    role: document.getElementById('role').checked.toString()
  }

  var okStatus = true;

  if (!(isValidName(objToSend.firstName))) { //= 'invalid first name';
    document.getElementById("firstName").style.background = "#ff000036";
    okStatus = false;
  } else document.getElementById("firstName").style.background = "white";

  if (!(isValidName(objToSend.lastName))) { //= 'invalid last name';
    document.getElementById("lastName").style.background = "#ff000036";
    okStatus = false;
  } else document.getElementById("lastName").style.background = "white";

  if (!(isValidEmail(objToSend.email))) { //= 'invalid email';
    document.getElementById("email").style.background = "#ff000036";
    okStatus = false;
  } else document.getElementById("email").style.background = "white";

  if (!(isValidCardUID(objToSend.cardUID))) { //= 'invalid card UID';
    document.getElementById("cardUID").style.background = "#ff000036";
    okStatus = false;
  } else document.getElementById("cardUID").style.background = "white";

  if (okStatus === true) {
    var xhr = new XMLHttpRequest();
    xhr.withCredentials = true;
    xhr.addEventListener("readystatechange", function() {
      if (this.readyState === 4) {
        var status = xhr.getResponseHeader('x-status');
        if (status === 'ok') {
          document.getElementById('deleteAfterSuccess').classList = 'successStyle';
          document.getElementById('deleteAfterSuccess').innerHTML = `${objToSend.role ? 'administrator' : 'user'}
          <h1>${objToSend.firstName} ${objToSend.lastName}</h1>
          was successfully added <p> link for creating password was sent to: ${objToSend.email}<p>`;
        } else {
          document.getElementById('statusDiv').innerHTML = status;
          document.getElementById("statusDiv").classList.add("fadeClass");
        }
      }
    });
    xhr.open("POST", postURL + '/insertuser');
    xhr.setRequestHeader("content-type", "application/json");
    xhr.setRequestHeader("cache-control", "no-cache");
    xhr.send(JSON.stringify(objToSend));
  }
}
