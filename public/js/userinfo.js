var setUserObj;
var userInfoAttendance = new Array(42);
var season = (1 + (new Date()).getMonth()) + '-' + (new Date()).getFullYear();
var slctMonth = 0;
var slctLi;


function updateSelectedUserObject() {
  setUserObj = accounts.find(function(obj) {
    return obj._id === localStorage.getItem('user_id');
  });
  delete setUserObj.createdAt;
}

function monthShiftToSeason(mountShft, actualSeason) {
  let splited = actualSeason.split('-');
  return (((((Number(splited[0]) - 1 + mountShft) % 12) + 12) % 12) + 1) + '-' + (
  Number(splited[1]) + Math.floor((Number(splited[0]) - 1 + mountShft) / 12));
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

function fillAttWithReq(res1, att1, shiftOfM){
  let year = (new Date()).getFullYear();
  let month = (new Date()).getMonth() + shiftOfM;
  let firstDay = new Date(year, month, 1);
  let from = firstDay.getDay() === 0 ? 7 : firstDay.getDay();
  from--;
  for(let x = 0; x < att1.length; x++){
    att1[x] = new Array;
  }
  res1.forEach((rec) => {
    let date = new Date(rec.date);
    att1[date.getDate() + from - 1].push({action: rec.action, type: rec.type, from: rec.from, date: date});
  });
}

function userInfoCreateCalendar(monthShift, callback) {
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

  let date = new Date();
  let year = date.getFullYear();
  let month = date.getMonth() + monthShift;
  let firstDay = new Date(year, month, 1);
  let lastDay = new Date(year, month + 1, 0);
  let from = firstDay.getDay() === 0 ? 7 : firstDay.getDay();
  from--;
  var to = lastDay.getDate() + from;

  document.getElementById('userInfoCalDate').innerHTML = monthNames[((month % 12) + 12) % 12] + ' ' + firstDay.getFullYear();
  var monthChildrens = document.getElementById("userInfoCalMonth").children;
  for (var i = 0; i < 42; i++) { //vymazanie vyplnenia kalendáru kvôli listovaniu mesiacov
    monthChildrens[i].innerHTML = '';
    monthChildrens[i].classList.remove('no-hover');
    monthChildrens[i].classList.remove('unselectable');
    document.getElementById("userInfoCalMonth").children[i].onclick = function() {}; //vymazanie predchádzajúcej funckie
  }

  attendanceRequest(setUserObj._id, monthShiftToSeason(monthShift, season), (res) => {
    fillAttWithReq(res, userInfoAttendance, monthShift);
    userInfoAttendance.forEach((rec) => {
      rec.unshift({overlap: false});
    });
    for (let liNumb = 0; liNumb < 42; liNumb++) {
      if (liNumb >= from && liNumb < to) {
        userInfoAttendance[liNumb][0].overlap = liNumb - from + 1;
        let dayDate = liNumb + 1 - from;
        monthChildrens[liNumb].innerHTML = dayDate;
        monthChildrens[liNumb].insertAdjacentHTML('afterbegin', '<div></div>');
        if ((dayDate > date.getDate() && monthShift === 0) || monthShift > 0) { //future days unselectable
          monthChildrens[liNumb].classList.add('no-hover');
          monthChildrens[liNumb].classList.add('unselectable');
        } else {

          if (userInfoAttendance[liNumb].length - 1 !== 0) {
            monthChildrens[liNumb].getElementsByTagName('div')[0].setAttribute("class", "triangle");
            for (let i = 1; i < userInfoAttendance[liNumb].length; i += 2) { // neuplna dochadzka
              let recordOne = userInfoAttendance[liNumb][i];
              let recordTwo = userInfoAttendance[liNumb][i + 1];
              if (recordOne == undefined || recordTwo == undefined || recordOne.action !== 'arrival' || recordTwo.action !== 'departure') {
                monthChildrens[liNumb].getElementsByTagName('div')[0].style.background = '#ca4646';
                break;
              }
            }
          }

          monthChildrens[liNumb].onclick = function() {
            slctLi = Array.from(this.parentNode.children).indexOf(this);
            document.getElementById('userInfoTableBody').innerHTML = '';
            let numbOfRecords = userInfoAttendance[slctLi].length; //length undefined??
            if (!(numbOfRecords - 1)) {
              document.getElementById('userInfoNoRecords').style.display = 'flex';
            } else {
              document.getElementById('userInfoNoRecords').style.display = 'none';
            }
            for (let i = 1; i < numbOfRecords; i++) {
              let lateFlag = true;
              let workTime = 8000;
              let records = userInfoAttendance[slctLi];
              if (records[i + 1] !== undefined && records[i].action === 'arrival' && records[i + 1].action === 'departure') {
                let minuteDif = (Math.trunc(records[i + 1].date.getTime() / 60000) - Math.trunc(records[i].date.getTime() / 60000));
                document.getElementById('userInfoTableBody').insertAdjacentHTML('beforeend', `
                         <tr>
                           ${`${lateFlag == true ? '<td class="donut">' : '<td>'}` + `${records[i].from == 'PC' ? '(PC) ' : ''}` + records[i].date.getHours() + ':' + `${records[i].date.getMinutes()}`.padStart(2, '0') + `${records[i].type.length != 0 ? (' - ' + records[i].type) : ''}`}</td>
                           <td>${`${records[i + 1].from == 'PC' ? '(PC) ' : ''}` + records[i + 1].date.getHours() + ':' + `${records[i + 1].date.getMinutes()}`.padStart(2, '0') + `${records[i + 1].type.length != 0 ? (' - ' + records[i + 1].type) : ''}`}</td>
                           ${`${minuteDif < workTime ? '<td class="donut">' : '<td>'}` + `${Math.trunc(minuteDif / 60) != 0 ? (Math.trunc(minuteDif / 60) + 'h') : ''}` + (minuteDif % 60) + 'm'}</td>
                         </tr>
                         `);
                i++;
              } else {
                if (records[i].action === 'arrival') {
                  document.getElementById('userInfoTableBody').insertAdjacentHTML('beforeend', `
                           <tr>
                             ${`${lateFlag == true ? '<td class="donut">' : '<td>'}` + `${records[i].from == 'PC' ? '(PC) ' : ''}` + records[i].date.getHours() + ':' + `${records[i].date.getMinutes()}`.padStart(2, '0') + `${records[i].type.length != 0 ? (' - ' + records[i].type) : ''}`}</td>
                             <td class="donut"></td>
                             <td></td>
                           </tr>
                           `);
                } else if (records[i].action === 'departure') {
                  document.getElementById('userInfoTableBody').insertAdjacentHTML('beforeend', `
                           <tr>
                             <td class="donut"></td>
                             <td>${`${records[i].from == 'PC' ? '(PC) ' : ''}` + records[i].date.getHours() + ':' + `${records[i].date.getMinutes()}`.padStart(2, '0') + `${records[i].type.length != 0 ? (' - ' + records[i].type) : ''}`}</td>
                             <td></td>
                           </tr>
                           `);
                }
              }
            }
            document.getElementById('userInfoBackToCalendar').style.opacity = '1';
            document.getElementById('userInfoBackToCalendar').style.cursor = 'pointer';
            document.getElementById('userInfoCalendar').style.display = 'none';
            document.getElementById('downloadCSV').style.display = 'none';
            document.getElementById('userInfoCalPrev').style.display = 'none';
            document.getElementById('userInfoCalNext').style.display = 'none';
            document.getElementById('userInfoDateBack').style.display = 'flex';
            document.getElementById('userInfoDayPrev').style.display = 'flex';
            document.getElementById('userInfoDayNext').style.display = 'flex';
            document.getElementById('userInfoAttGroup').style.display = 'flex';
            document.getElementById('userInfoCalDay').innerHTML = userInfoAttendance[slctLi][0].overlap + '.&nbsp';
          };
        }
      }
    }
    callback();
  });
}

document.getElementById('userInfoBackToCalendar').onclick = function () {
  document.getElementById('userInfoBackToCalendar').style.opacity = '0.5';
  document.getElementById('userInfoBackToCalendar').style.cursor = 'default';
  document.getElementById('userInfoAttGroup').style.display = 'none';
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
  if(slctLi != 0 && userInfoAttendance[slctLi - 1][0].overlap !== false){
    document.getElementById('userInfoCalMonth').children[slctLi - 1].click();
  } else {
    slctMonth--;
    userInfoCreateCalendar(slctMonth, () => {
      let i = 26;
      while(i < 42){
        if(userInfoAttendance[i][0].overlap === false){
          document.getElementById('userInfoCalMonth').children[i - 1].click();
          break;
        }
        i++;
      }
    });
  }
}

document.getElementById('userInfoDayNext').onclick = function () {
  if(userInfoAttendance[slctLi + 1][0].overlap !== false){
    document.getElementById('userInfoCalMonth').children[slctLi + 1].click();
  } else if (slctMonth < 0){
    slctMonth++;
    userInfoCreateCalendar(slctMonth, () => {
      let i = 8;
      while(i >= 0){
        if(userInfoAttendance[i][0].overlap === false){
          document.getElementById('userInfoCalMonth').children[i + 1].click();
          break;
        }
        i--;
      }
      document.getElementById('userInfoCalMonth').children[0].click();
    });
  }
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

document.getElementById('userInfoLateArrivalTrue').onclick = function() {
  this.style.display = 'none';
  document.getElementById('userInfoLateArrivalFalse').style.display = 'flex'
}

document.getElementById('userInfoLateArrivalFalse').onclick = function() {
  this.style.display = 'none';
  document.getElementById('userInfoLateArrivalTrue').style.display = 'flex'
}

document.getElementById('userInfoMWTTrue').onclick = function() {
  this.style.display = 'none';
  document.getElementById('userInfoMVTFalse').style.display = 'flex'
}

document.getElementById('userInfoMVTFalse').onclick = function() {
  this.style.display = 'none';
  document.getElementById('userInfoMWTTrue').style.display = 'flex'
}

document.getElementById('userInfoRecordMissingTrue').onclick = function() {
  this.style.display = 'none';
  document.getElementById('userInfoRecordMissingFalse').style.display = 'flex'
}

document.getElementById('userInfoRecordMissingFalse').onclick = function() {
  this.style.display = 'none';
  document.getElementById('userInfoRecordMissingTrue').style.display = 'flex'
}

document.getElementById('userInfoCancelSettings').onclick = function() {
  document.getElementById('contentShadow').click();
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
                   //slctLiToInnerText(slctMonth,slctLi),                                  OPRAVIT!!!!!
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
userInfoCreateCalendar(slctMonth, () => {
  let LIDay = (new Date()).getDate();
  for(let y = 0; y < 42; y++){
    if(userInfoAttendance[y][0].overlap === LIDay){
      document.getElementById('userInfoCalMonth').children[y].click();
      break;
    }
  }
});
fillUserInfo(setUserObj, season);
