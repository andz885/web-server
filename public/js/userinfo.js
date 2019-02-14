var setUserObj;
var userInfoAttendance;
var season = (1 + (new Date()).getMonth()) + '-' + (new Date()).getFullYear();
var slctMonth = 0;
var slctLi;

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
  csvFile += 'Date;Arrival;Type;From;Departure;Type;from;\n';
  for (let i = 0; i < json.length; i++) {

    var date1 = new Date(json[i].date);
    var date2 = new Date(json[i + 1] === undefined ? 0 : json[i + 1].date);

    if (json[i + 1] !== undefined && json[i].action === 'arrival' && json[i + 1].action === 'departure' && date1.getDate() === date2.getDate()) {
      csvFile += date1.getDate() + '.' + (date1.getMonth() + 1) + '.' + date1.getFullYear() + ';';
      csvFile += date1.getHours() + ':' + date1.getMinutes() + ';';
      csvFile += json[i].type + ';';
      csvFile += json[i].from + ';';
      csvFile += date2.getHours() + ':' + date2.getMinutes() + ';';
      csvFile += json[i + 1].type + ';';
      csvFile += json[i + 1].from + ';';
      i++;
    } else if (json[i].action === 'arrival') {
      csvFile += date1.getDate() + '.' + (date1.getMonth() + 1) + '.' + date1.getFullYear() + ';';
      csvFile += date1.getHours() + ':' + date1.getMinutes() + ';';
      csvFile += json[i].type + ';';
      csvFile += json[i].from + ';;;;';
    } else if (json[i].action === 'departure') {
      csvFile += date1.getDate() + '.' + (date1.getMonth() + 1) + '.' + date1.getFullYear() + ';';
      csvFile += ';;;'
      csvFile += date1.getHours() + ':' + date1.getMinutes() + ';';
      csvFile += json[i].type + ';';
      csvFile += json[i].from + ';';
    }
    csvFile += '\n';
  }
  return csvFile;
}

function slctLiToInnerText(selectedMonth, selectedLi){
let date = new Date();
date.setMonth(date.getMonth() + selectedMonth);
date.setDate(1);
let day = selectedLi + 1 - (date.getDay() === 0 ? 6 : (date.getDay() - 1));
date.setMonth(date.getMonth() + selectedMonth + 1);
date.setDate(0);
if(day > date.getDate())
return 'OVERFLOW';
else
return day;
}

function userInfoCreateCalendar(monthShift, callback) {
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
  for (var i = 0; i < 42; i++) { //vymazanie vyplnenia kalendáru kvôli listovaniu mesiacov
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
  userInfoAttendance = new Array(lastDay.getDate());
  for (let x = 0; x < userInfoAttendance.length; x++)
    userInfoAttendance[x] = new Array();
  attendanceRequest(setUserObj._id, monthShiftToSeason(monthShift, season), (res) => {
    var attCursor = 0;
    for (from; from < to; from++) {

      while (true) { //filling userInfoAttendance
        var resItem = res[attCursor];
        if (resItem === undefined)
          break;
        var resItemDate = new Date(resItem.date);
        if (resItemDate.getDate() !== dayDate)
          break;
        userInfoAttendance[dayDate - 1].push({action: resItem.action, type: resItem.type, from: resItem.from, date: resItemDate});
        attCursor++;
      }

      monthChildrens[from].innerHTML = dayDate;
      monthChildrens[from].insertAdjacentHTML('afterbegin', '<div></div>');
      if ((dayDate > date.getDate() && monthShift === 0) || monthShift > 0) { //future days unselectable
        monthChildrens[from].classList.add('no-hover');
        monthChildrens[from].classList.add('unselectable');
      } else {

        if (userInfoAttendance[dayDate - 1].length !== 0) {

          monthChildrens[from].getElementsByTagName('div')[0].setAttribute("class", "triangle");
          for (let i = 0; i < userInfoAttendance[dayDate - 1].length; i += 2) { // neuplna dochadzka
            let recordOne = userInfoAttendance[dayDate - 1][i];
            let recordTwo = userInfoAttendance[dayDate - 1][i + 1];
          if (recordOne == undefined || recordTwo == undefined || recordOne.action !== 'arrival' || recordTwo.action !== 'departure') {
              monthChildrens[from].getElementsByTagName('div')[0].style.background = '#ca4646';
              break;
            }
          }
        }
        monthChildrens[from].onclick = function () {
          slctLi = Array.from(this.parentNode.children).indexOf(this);
          document.getElementById('userInfoTableBody').innerHTML = '';
          let eventN = Number(event.path[0].innerText);
          let numbOfRecords = userInfoAttendance[eventN - 1].length; //length undefined??
          if (!numbOfRecords) {
            document.getElementById('userInfoNoRecords').style.display = 'flex';
          } else {
            document.getElementById('userInfoNoRecords').style.display = 'none';
          }
            for (let i = 0; i < numbOfRecords; i++) {
              let records = userInfoAttendance[eventN - 1];
              if (records[i + 1] !== undefined && records[i].action === 'arrival' && records[i + 1].action === 'departure') {
                let minuteDif = (Math.trunc(records[i + 1].date.getTime() / 60000) - Math.trunc(records[i].date.getTime() / 60000));
                document.getElementById('userInfoTableBody').insertAdjacentHTML('beforeend', `
                <tr>
                  <td>${records[i].date.getHours() + ':' + `${records[i].date.getMinutes()}`.padStart(2,'0') + ' - ' + records[i].type}</td>
                  <td>${records[i + 1].date.getHours() + ':' + `${records[i + 1].date.getMinutes()}`.padStart(2,'0') + ' - ' + records[i + 1].type}</td>
                  <td>${Math.trunc(minuteDif / 60) + 'h ' + (
                minuteDif % 60) + 'm'}
                </tr>
                `);
                i++;
              } else {
                if (records[i].action === 'arrival') {
                  document.getElementById('userInfoTableBody').insertAdjacentHTML('beforeend', `
                  <tr>
                    <td>${records[i].date.getHours() + ':' + `${records[i].date.getMinutes()}`.padStart(2,'0') + ' - ' + records[i].type}</td>
                    <td></td>
                    <td></td>
                  </tr>
                  `);
                } else if (records[i].action ==='departure') {
                  document.getElementById('userInfoTableBody').insertAdjacentHTML('beforeend', `
                  <tr>
                    <td></td>
                    <td>${records[i].date.getHours() + ':' + `${records[i].date.getMinutes()}`.padStart(2,'0') + ' - ' + records[i].type}</td>
                    <td></td>
                  </tr>
                  `);
                }
              }
            }
            document.getElementById('userInfoCalendar').style.display = 'none';
            document.getElementById('downloadCSV').style.display = 'none';

            document.getElementById('userInfoCalPrev').style.display = 'none';
            document.getElementById('userInfoCalNext').style.display = 'none';

            document.getElementById('userInfoDateBack').style.display = 'flex';

            document.getElementById('userInfoDayPrev').style.display = 'flex';
            document.getElementById('userInfoDayNext').style.display = 'flex';

            document.getElementById('userInfoAttDetail').style.display = 'flex';
            document.getElementById('userInfoCalDay').innerHTML = eventN + '.&nbsp';
        };
      }
      dayDate++;
    }
    callback();
  });
}

document.getElementById('userInfoBackToCalendar').onclick = function () {
  document.getElementById('userInfoAttDetail').style.display = 'none';
  document.getElementById('userInfoDateBack').style.display = 'none';

  document.getElementById('userInfoDayPrev').style.display = 'none';
  document.getElementById('userInfoDayNext').style.display = 'none';

  document.getElementById('downloadCSV').style.display = 'flex';

  document.getElementById('userInfoCalPrev').style.display = 'flex';
  document.getElementById('userInfoCalNext').style.display = 'flex';

  document.getElementById('userInfoCalendar').style.display = 'flex';
  document.getElementById('userInfoCalDay').innerHTML = '';
}

document.getElementById('userInfoDayPrev').onclick = function () {
  var monthDays = document.getElementById('userInfoCalMonth').children;
  if(slctLiToInnerText(slctMonth, slctLi) > 1){
    monthDays[slctLi - 1].click();
  } else {
    slctMonth--;
    userInfoCreateCalendar(slctMonth, () => {
      monthDays = document.getElementById('userInfoCalMonth').children;
      let i = 26;
      while(i < 42){
        if(slctLiToInnerText(slctMonth, i) === "OVERFLOW"){
          monthDays[i - 1].click();
          break;
        }
        i++;
      }
    });
  }
}

document.getElementById('userInfoDayNext').onclick = function () {
  var monthDays = document.getElementById('userInfoCalMonth').children;
  if(slctLiToInnerText(slctMonth, slctLi + 1) !== "OVERFLOW"){
    monthDays[slctLi + 1].click();
  } else if (slctMonth < 0){
    slctMonth++;
    userInfoCreateCalendar(slctMonth, () => {
      monthDays = document.getElementById('userInfoCalMonth').children;
      let i = 8;
      while(i >= 0){
        if(slctLiToInnerText(slctMonth, i) === 1){
          monthDays[i].click();
          break;
        }
        i--;
      }
    });
  }
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
  userInfoCreateCalendar(slctMonth, () => {});
}

document.getElementById('userInfoCalNext').onclick = function() {
  if(slctMonth >= 0) return;
  slctMonth++;
  userInfoCreateCalendar(slctMonth, () => {});
}

//neskorý príchod
//skorý odchod
//neuplna dochadzka
//málo odrobeného času
//vložený záznam z PC

document.getElementById('userInfoCalSetting').onclick = function() {
  showShadow();
  document.getElementsByClassName('beforeShadow')[1].style.display = 'flex';
}

document.getElementById('backToEmployees').onclick = function() {
  document.getElementById('employees').click();
}

document.getElementById('userInfoDateBack').onclick = function() {
  showShadow();
  document.getElementsByClassName('beforeShadow')[0].style.display = 'flex';
  document.getElementById('userInfoDateBackHours').value = '';
  document.getElementById('userInfoDateBackMinutes').value = '';
  document.getElementById('userInfoDateBackType').value = '';
  document.getElementById('content').style.setProperty('--cssArDpSizeVar', '15px');
  document.getElementById('userInfoDateBackHours').focus();
}

document.getElementById('userInfoDateBackArrival').onclick = function() {
  document.getElementById('content').style.setProperty('--cssArDpSizeVar', '10px');
}

document.getElementById('userInfoDateBackDeparture').onclick = function() {
  document.getElementById('content').style.setProperty('--cssArDpSizeVar', '20px');
}

document.getElementById('userInfoDateBackNow').onclick = function() {
  let date = new Date();
  document.getElementById('userInfoDateBackHours').value = date.getHours() < 10 ? ('0' + date.getHours()) : date.getHours();
  document.getElementById('userInfoDateBackMinutes').value = date.getMinutes() < 10 ? ('0' + date.getMinutes()) : date.getMinutes();
  document.getElementById('userInfoDateBackType').focus();
}

document.getElementById('userInfoCancelDateBack').onclick = function() {
  document.getElementById('contentShadow').click();
}

document.getElementById('userInfoDateBackHours').oninput  = function() {
setTimeout(() => {
  let value = document.getElementById('userInfoDateBackHours').value;
    let i = -1;
    while(Number(value) > 23 || Number(value) == NaN || value.length > 2){
      value = value.slice(0, i);
      i--;
    }
    document.getElementById('userInfoDateBackHours').value = value;
    if(value.length === 2) {
      document.getElementById('userInfoDateBackMinutes').focus();
    }
},100);
}

document.getElementById('userInfoDateBackMinutes').oninput  = function() {
setTimeout(() => {
  let value = document.getElementById('userInfoDateBackMinutes').value;
    let i = -1;
    while(Number(value) > 59 || Number(value) == NaN || value.length > 2){
      value = value.slice(0, i);
      i--;
    }
    document.getElementById('userInfoDateBackMinutes').value = value;
    if(value.length === 2) {
      document.getElementById('userInfoDateBackType').focus();
    }
},100);
}


document.getElementById('userInfoInsertDateBack').onclick = function() {

let type = document.getElementById('userInfoDateBackType').value;
if(type.length > 12) {
  alert('Maximum note length is 12 characters');
  return;
}

let action;
if(getComputedStyle(document.getElementById('content')).getPropertyValue('--cssArDpSizeVar') === '10px'){
  action = 'arrival';
} else if (getComputedStyle(document.getElementById('content')).getPropertyValue('--cssArDpSizeVar') === '20px'){
  action = 'departure';
} else {
  alert('Please, select an action');
  return;
}
  let data = JSON.stringify({
  "cardUID": setUserObj.cardUID,
  "action": action,
  "type" : type,
  "from" : "PC",
  "date": (new Date(monthShiftToSeason(slctMonth,season).split('-')[1],
                   Number(monthShiftToSeason(slctMonth,season).split('-')[0]) - 1,
                   slctLiToInnerText(slctMonth,slctLi),
                   document.getElementById('userInfoDateBackHours').value,
                   document.getElementById('userInfoDateBackMinutes').value,
                   0,
                   0)).getTime() / 1000
});

var xhr = new XMLHttpRequest();
xhr.withCredentials = true;

xhr.addEventListener("readystatechange", function() {
  if (this.readyState === 4) {
    let status = xhr.getResponseHeader('x-status');
    if (status === "ok") {
      userInfoCreateCalendar(slctMonth, () => {
        document.getElementById('userInfoCalMonth').children[slctLi].click();
        document.getElementById('contentShadow').click();
      });
    } else {
      alert(status);
    }
  }
});

xhr.open("POST", postURL + '/cardattached');
xhr.setRequestHeader("content-type", "application/json");
xhr.setRequestHeader("cache-control", "no-cache");
xhr.send(data);
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
userInfoCreateCalendar(slctMonth, () => {});
fillUserInfo(setUserObj, season);
