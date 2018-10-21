function firstLetterToUpperCase(string) {
  if (string) return string[0].toUpperCase() + string.substring(1);
}

function isValidEmail(email) { //email validation
  var atpos = email.indexOf("@");
  var dotpos = email.lastIndexOf(".");
  if (atpos < 1 || dotpos < atpos + 2 || dotpos + 2 >= email.length) {
    return false;
  }
  return true;
}

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

function isValidCardUID(string) {
  if (string.length !== 8) return false;
  var asciiNumb;
  for (var i = 0; i < 8; i++) {
    asciiNumb = string.charCodeAt(i);
    if (asciiNumb < 48 || asciiNumb > 70 || (asciiNumb > 57 && asciiNumb < 65)) return false;
  }
  return true;
}

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

document.getElementsByClassName('addButton')[0].onclick = function() {
  document.getElementById('statusDiv').innerHTML = '';
  document.getElementById("statusDiv").classList.remove("fadeClass");

  var objToSend = {
    token: localStorage.getItem("token"),
    firstName: firstLetterToUpperCase(document.getElementById('firstName').value.trim()),
    lastName: firstLetterToUpperCase(document.getElementById('lastName').value.trim()),
    email: document.getElementById('email').value,
    cardUID: document.getElementById('cardUID').value.toUpperCase(),
    role: document.getElementById('role').checked
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
          ${objToSend.firstName} ${objToSend.lastName}
          was successfully added <p> link for creating password was sent to: ${objToSend.email}<p>`;
          console.log(xhr.getResponseHeader('messageID'));
        } else {
          document.getElementById('statusDiv').innerHTML = status;
          document.getElementById("statusDiv").classList.add("fadeClass");
        }
      }
    });
    xhr.open("POST", postURL + '/adduser');
    xhr.setRequestHeader("content-type", "application/json");
    xhr.setRequestHeader("cache-control", "no-cache");
    xhr.send(JSON.stringify(objToSend));
  }
}