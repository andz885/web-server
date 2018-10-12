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
  for (var i = 0; i < string.length; i++) {
    if (!(isNaN(string[i]))) return false;
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

document.getElementsByClassName('addButton')[0].onclick = function() {
  var objectToSend = {
    token: localStorage.getItem("token"),
    firstName: firstLetterToUpperCase(document.getElementById('firstName').value.trim()),
    lastName: firstLetterToUpperCase(document.getElementById('lastName').value.trim()),
    email: document.getElementById('email').value,
    cardUID: document.getElementById('cardUID').value.toUpperCase(),
    role: document.getElementById('role').checked
  }
  console.log(objectToSend);

  var okStatus = true;

  if (!(isValidName(objectToSend.firstName))) { //= 'invalid first name';
    document.getElementById("firstName").style.background = "#ff000036";
    okStatus = false;
  } else document.getElementById("firstName").style.background = "white";

  if (!(isValidName(objectToSend.lastName))) { //= 'invalid last name';
    document.getElementById("lastName").style.background = "#ff000036";
    okStatus = false;
  } else document.getElementById("lastName").style.background = "white";

  if (!(isValidEmail(objectToSend.email))) { //= 'invalid email';
    document.getElementById("email").style.background = "#ff000036";
    okStatus = false;
  } else document.getElementById("email").style.background = "white";

  if (!(isValidCardUID(objectToSend.cardUID))) { //= 'invalid card UID';
    document.getElementById("cardUID").style.background = "#ff000036";
    okStatus = false;
  } else document.getElementById("cardUID").style.background = "white";

}
