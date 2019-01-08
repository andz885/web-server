var setUserObj;
var userInfoAttendance;
var season = (1 + (new Date()).getMonth()) + '-' + (
new Date()).getFullYear();
var slctMonth = 0;

function updateSelectedUserObject() {
  setUserObj = accounts.find(function(obj) {
    return obj._id === localStorage.getItem('user_id');
  });
  delete setUserObj.createdAt;
}

function attendanceRequest(user_id, season, callback) {
  var url = new URL(document.URL);
  var xhr = new XMLHttpRequest();
  xhr.withCredentials = true;
  xhr.addEventListener("readystatechange", function() {
    if (this.readyState === 4) {
      let status = xhr.getResponseHeader('x-status');
      if (status === 'ok') {
        callback(JSON.parse(xhr.response));
      } else {
        alert(status);
      }
    }
  });
  xhr.open("GET", postURL + "/getattendance");
  xhr.setRequestHeader("content-type", "application/json");
  xhr.setRequestHeader("cache-control", "no-cache");
  xhr.setRequestHeader("user_id", user_id);
  xhr.setRequestHeader("season", season);
  xhr.send();
}

function downloadAttendance(data, filename) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(data));
  element.setAttribute('download', filename);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

function jsonToCsv(json) {
  var csvFile = '';
  csvFile += 'Date;Arrival;Departure;Type;\n';
  for (let i = 0; i < json.length; i++) {
    var date1 = new Date(json[i].date);
    var action1 = json[i].action.split('-');

    if (i === (json.length - 1)) {
      if (action1[0] === 'arrival') {
        csvFile += date1.getDate() + '.' + (
        date1.getMonth() + 1) + '.' + date1.getFullYear() + ';';
        csvFile += date1.getHours() + ':' + date1.getMinutes() + ';';
        csvFile += ';'
        csvFile += ';'
      }
      if (action1[0] === 'departure') {
        csvFile += date1.getDate() + '.' + (
        date1.getMonth() + 1) + '.' + date1.getFullYear() + ';';
        csvFile += ';'
        csvFile += date1.getHours() + ':' + date1.getMinutes() + ';';
        csvFile += action1[1] + ';'
      }
      csvFile += '\n';
      break;
    }

    var date2 = new Date(json[i + 1].date);
    var action2 = json[i + 1].action.split('-');

    if (action1[0] === 'arrival' && action2[0] === 'departure' && date1.getDate() === date2.getDate()) {
      csvFile += date1.getDate() + '.' + (
      date1.getMonth() + 1) + '.' + date1.getFullYear() + ';';
      csvFile += date1.getHours() + ':' + date1.getMinutes() + ';';
      csvFile += date2.getHours() + ':' + date2.getMinutes() + ';';
      csvFile += action2[1] + ';';
      i++;
    } else if (action1[0] === 'arrival') {
      csvFile += date1.getDate() + '.' + (
      date1.getMonth() + 1) + '.' + date1.getFullYear() + ';';
      csvFile += date1.getHours() + ':' + date1.getMinutes() + ';';
      csvFile += ';'
      csvFile += ';'
    } else if (action1[0] === 'departure') {
      csvFile += date1.getDate() + '.' + (
      date1.getMonth() + 1) + '.' + date1.getFullYear() + ';';
      csvFile += ';'
      csvFile += date1.getHours() + ':' + date1.getMinutes() + ';';
      csvFile += action1[1] + ';'
    }
    csvFile += '\n';
  }
  return csvFile;
}

function userInfoCreateCalendar(monthShift) {
  var date = new Date();
  var year = date.getFullYear();
  var month = date.getMonth() + monthShift;
  var firstDay = new Date(year, month, 1);
  var lastDay = new Date(year, month + 1, 0);
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];
  document.getElementById('userInfoCalDate').innerHTML = monthNames[((month % 12) + 12) % 12] + ' ' + firstDay.getFullYear();
  var monthChildrens = document.getElementById("userInfoCalMonth").children;
  for (var i = 0; i < 42; i++) {
    monthChildrens[i].innerHTML = '';
    monthChildrens[i].classList.remove('no-hover');
    monthChildrens[i].classList.remove('unselectable');
    document.getElementById("userInfoCalMonth").children[i].onclick = function() {};
  }
  var dayDate = 1;
  var from = firstDay.getDay();
  if (from === 0)
    from = 7;
  from--;
  var to = lastDay.getDate() + from;
  var attCursor = 0;
  userInfoAttendance = new Array(lastDay.getDate());
  for (let x = 0; x < userInfoAttendance.length; x++)
  userInfoAttendance[x] = new Array();
  attendanceRequest(setUserObj._id, monthShiftToSeason(monthShift, season), (res) => {
    for (from; from < to; from++) {

      monthChildrens[from].innerHTML = dayDate;
      monthChildrens[from].insertAdjacentHTML('afterbegin', '<div class="triangle"></div> <div class="tooltip"></div>');
      // monthChildrens[from].addEventListener('mousemove', (event) => {
      //   document.querySelectorAll('.tooltip')[asdf].style.display = 'true';
      //   document.querySelectorAll('.tooltip')[asdf].style.left = event.clientX;
      //   document.querySelectorAll('.tooltip')[asdf].style.top = event.clientY;
      // });
      while (true) {
        var resItem = res[attCursor];
        if (resItem === undefined)
          break;
        var resItemDate = new Date(resItem.date);
        if (resItemDate.getDate() !== dayDate)
          break;
        userInfoAttendance[dayDate].push({action: resItem.action, date: resItem.date});
        attCursor++;
      }

      // if((dayDate > date.getDate() && monthShift === 0) || monthShift > 0){
      //   monthChildrens[from].classList.add('no-hover');
      //   monthChildrens[from].classList.add('unselectable');
      // } else {
      //   document.getElementById("userInfoCalMonth").children[from].onclick = function() {
      //   on date click
      //  }
      // }
      dayDate++;
    }
  });
}

function monthShiftToSeason(mountShft, actualSeason) {
  let splited = actualSeason.split('-');
  return (((((Number(splited[0]) - 1 + mountShft) % 12) + 12) % 12) + 1) + '-' + (
  Number(splited[1]) + Math.floor((Number(splited[0]) - 1 + mountShft) / 12));
}

function fillUserInfo(userObj, fillSeason) {
  document.getElementById('userInfoFirstName').value = userObj.firstName;
  document.getElementById('userInfoLastName').value = userObj.lastName;
  document.getElementById('userInfoEmail').value = userObj.email;
  document.getElementById('userInfoCardUID').value = userObj.cardUID;
  if (userObj.role === 'true') {
    document.getElementById('userInfoRole').checked = true;
  }
}

document.getElementById('downloadCSV').onclick = function() {
  attendanceRequest(setUserObj._id, monthShiftToSeason(slctMonth, season), (res) => {
    if (res.length === 0) {
      alert('no database records found for this month')
    } else {
      downloadAttendance(jsonToCsv(res), setUserObj.firstName + ' ' + setUserObj.lastName + ' ' + season + '.csv');
    }
  })
}

document.getElementById('userInfoCalPrev').onclick = function() {
  slctMonth--;
  userInfoCreateCalendar(slctMonth);
}

document.getElementById('userInfoCalNext').onclick = function() {
  slctMonth++;
  userInfoCreateCalendar(slctMonth);
}

document.getElementById('userInfoEdit').onclick = function() {
  var state = document.getElementById('userInfoEdit').innerHTML;
  if (state === 'Edit') {
    document.getElementById('userInfoFirstName').removeAttribute('disabled');
    document.getElementById('userInfoLastName').removeAttribute('disabled');
    document.getElementById('userInfoEmail').removeAttribute('disabled');
    document.getElementById('userInfoCardUID').removeAttribute('disabled');
    document.getElementById('userInfoRole').removeAttribute('disabled');
    document.getElementsByClassName('slider')[0].style.cursor = 'pointer';
    document.getElementById('userInfoEdit').innerHTML = 'Save';
  } else if (state === 'Save') {

    let objToSend = {
      _id: setUserObj._id,
      firstName: firstLetterToUpperCase(document.getElementById('userInfoFirstName').value.trim()),
      lastName: firstLetterToUpperCase(document.getElementById('userInfoLastName').value.trim()),
      email: document.getElementById('userInfoEmail').value,
      cardUID: document.getElementById('userInfoCardUID').value.toUpperCase(),
      role: document.getElementById('userInfoRole').checked.toString()
    }

    if (JSON.stringify(objToSend) === JSON.stringify(setUserObj)) {
      document.getElementById('userInfoFirstName').setAttribute('disabled', "");
      document.getElementById('userInfoLastName').setAttribute('disabled', "");
      document.getElementById('userInfoEmail').setAttribute('disabled', "");
      document.getElementById('userInfoCardUID').setAttribute('disabled', "");
      document.getElementById('userInfoRole').setAttribute('disabled', "");
      document.getElementsByClassName('slider')[0].style.cursor = 'default';
      document.getElementById('userInfoEdit').innerHTML = 'Edit';
      return;
    }

    let okStatus = true;

    if (!(isValidName(objToSend.firstName))) { //= 'invalid first name';
      document.getElementById("userInfoFirstName").style.background = "#ff000036";
      okStatus = false;
    } else
      document.getElementById("userInfoFirstName").style.background = "white";

    if (!(isValidName(objToSend.lastName))) { //= 'invalid last name';
      document.getElementById("userInfoLastName").style.background = "#ff000036";
      okStatus = false;
    } else
      document.getElementById("userInfoLastName").style.background = "white";

    if (!(isValidEmail(objToSend.email))) { //= 'invalid email';
      document.getElementById("userInfoEmail").style.background = "#ff000036";
      okStatus = false;
    } else
      document.getElementById("userInfoEmail").style.background = "white";

    if (!(isValidCardUID(objToSend.cardUID))) { //= 'invalid card UID';
      document.getElementById("userInfoCardUID").style.background = "#ff000036";
      okStatus = false;
    } else
      document.getElementById("userInfoCardUID").style.background = "white";

    if (okStatus === true) {
      var xhr = new XMLHttpRequest();
      xhr.withCredentials = true;
      xhr.addEventListener("readystatechange", function() {
        if (this.readyState === 4) {
          var status = xhr.getResponseHeader('x-status');
          if (status === 'ok') {
            askForAccounts((rec) => {
              accounts = rec;
              updateSelectedUserObject();
            });
            document.getElementById('userInfoFirstName').setAttribute('disabled', "");
            document.getElementById('userInfoLastName').setAttribute('disabled', "");
            document.getElementById('userInfoEmail').setAttribute('disabled', "");
            document.getElementById('userInfoCardUID').setAttribute('disabled', "");
            document.getElementById('userInfoRole').setAttribute('disabled', "");
            document.getElementsByClassName('slider')[0].style.cursor = 'default';
            document.getElementById('userInfoEdit').innerHTML = 'Edit';
            alert(xhr.getResponseHeader('x-status'));
          } else {
            document.getElementById('userInfoFirstName').value = setUserObj.firstName;
            document.getElementById('userInfoLastName').value = setUserObj.lastName;
            document.getElementById('userInfoEmail').value = setUserObj.email;
            document.getElementById('userInfoCardUID').value = setUserObj.cardUID;
            document.getElementById('userInfoRole').value = setUserObj.role;
            document.getElementById('userInfoFirstName').setAttribute('disabled', "");
            document.getElementById('userInfoLastName').setAttribute('disabled', "");
            document.getElementById('userInfoEmail').setAttribute('disabled', "");
            document.getElementById('userInfoCardUID').setAttribute('disabled', "");
            document.getElementById('userInfoRole').setAttribute('disabled', "");
            document.getElementsByClassName('slider')[0].style.cursor = 'default';
            document.getElementById('userInfoEdit').innerHTML = 'Edit';
            alert(xhr.getResponseHeader('x-status'));
          }
        }
      });
      xhr.open("POST", postURL + '/edituser');
      xhr.setRequestHeader("content-type", "application/json");
      xhr.setRequestHeader("cache-control", "no-cache");
      xhr.send(JSON.stringify(objToSend));
    }
  }
}

updateSelectedUserObject();
userInfoCreateCalendar(slctMonth);
fillUserInfo(setUserObj, season);
