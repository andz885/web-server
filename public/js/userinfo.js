var setUserObj;
var userInfoAttendance = new Array(42);
var season = (1 + (new Date()).getMonth()) + '-' + (new Date()).getFullYear();
var slctMonth = 0;
var slctLi;

function fillUserInfoSettings() {
  if(loggedUserObject.settings.arrivalSwitch){
    document.getElementById('userInfoLateArrivalTrue').style.display = 'flex';
  } else {
    document.getElementById('userInfoLateArrivalFalse').style.display = 'flex';
  }
  document.getElementById('userInfoSettingsArrivalFromHours').value = loggedUserObject.settings.arrivalFromHours;
  if(loggedUserObject.settings.arrivalFromMinutes < 10){
    document.getElementById('userInfoSettingsArrivalFromMinutes').value = '0' + loggedUserObject.settings.arrivalFromMinutes;
  } else {
    document.getElementById('userInfoSettingsArrivalFromMinutes').value = loggedUserObject.settings.arrivalFromMinutes;
  }
  document.getElementById('userInfoSettingsArrivalToHours').value = loggedUserObject.settings.arrivalToHours;
  if(loggedUserObject.settings.arrivalToMinutes < 10){
    document.getElementById('userInfoSettingsArrivalToMinutes').value = '0' + loggedUserObject.settings.arrivalToMinutes;
  } else {
    document.getElementById('userInfoSettingsArrivalToMinutes').value = loggedUserObject.settings.arrivalToMinutes;
  }
  if(loggedUserObject.settings.MWTSwitch){
    document.getElementById('userInfoMWTTrue').style.display = 'flex';
  } else {
    document.getElementById('userInfoMWTFalse').style.display = 'flex';
  }
  document.getElementById('userInfoSettingsMWTHours').value = loggedUserObject.settings.MWTHours;
  document.getElementById('userInfoSettingsMWTMinutes').value = loggedUserObject.settings.MWTMinutes;
}

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
    let exit;
    let badCalendar = false;
    for (let liNumb = 0; liNumb < 42; liNumb++) {
      exit = false;
      if (liNumb >= from && liNumb < to) {
        userInfoAttendance[liNumb][0].overlap = liNumb - from + 1;
        let dayDate = liNumb + 1 - from;
        monthChildrens[liNumb].innerHTML = dayDate;
        monthChildrens[liNumb].insertAdjacentHTML('afterbegin', '<div></div>');
        if ((dayDate > date.getDate() && monthShift === 0) || monthShift > 0) { //future days unselectable
          monthChildrens[liNumb].classList.add('no-hover');
          monthChildrens[liNumb].classList.add('unselectable');
        } else {
          if (userInfoAttendance[liNumb].length - 1 !== 0 ) { //ak je v ten den dochádzka
            monthChildrens[liNumb].getElementsByTagName('div')[0].setAttribute("class", "triangle");
             // neuplna dochadzka
              for (let i = 1; i < userInfoAttendance[liNumb].length; i += 2) {
                let recordOne = userInfoAttendance[liNumb][i];
                let recordTwo = userInfoAttendance[liNumb][i + 1];
                if (recordOne == undefined || recordTwo == undefined || recordOne.action !== 'arrival' || recordTwo.action !== 'departure') {
                  let date3 = new Date();
                  let date4 = recordOne.date;

                  if(recordOne.action == 'arrival' && recordTwo == undefined && (i + 1) == userInfoAttendance[liNumb].length && date3.getFullYear() === date4.getFullYear() && date3.getMonth() === date4.getMonth() && date3.getDate() === date4.getDate()){
                  } else {
                    monthChildrens[liNumb].getElementsByTagName('div')[0].style.background = '#ca4646';
                  badCalendar = true;
                  }
                  exit = true;
                  break;
                 }
               }
              if(loggedUserObject.settings.arrivalSwitch && !exit){ // neskorý príchod
                let minimum = loggedUserObject.settings.arrivalFromHours + loggedUserObject.settings.arrivalFromMinutes / 100;
                let maximum = loggedUserObject.settings.arrivalToHours + loggedUserObject.settings.arrivalToMinutes / 100;
                for (let i = 1; i < userInfoAttendance[liNumb].length; i += 2) {
                  let arrivalTime = userInfoAttendance[liNumb][i].date.getHours() + userInfoAttendance[liNumb][i].date.getMinutes() / 100;
                  if (arrivalTime > minimum && arrivalTime < maximum) {
                    monthChildrens[liNumb].getElementsByTagName('div')[0].style.background = '#ca4646';
                    exit = true;
                    badCalendar = true;
                    break;
                  }
                }
              }
              if(loggedUserObject.settings.MWTSwitch && !exit){ // málo odpracovaných hodín
                 let minuteDif = 0;
                 for (let i = 1; i < userInfoAttendance[liNumb].length; i += 2) {
                    minuteDif += Math.trunc(userInfoAttendance[liNumb][i + 1].date.getTime() / 60000) - Math.trunc(userInfoAttendance[liNumb][i].date.getTime() / 60000);
                  }
                  if (minuteDif < (loggedUserObject.settings.MWTHours * 60 + loggedUserObject.settings.MWTMinutes)){
                    monthChildrens[liNumb].getElementsByTagName('div')[0].style.background = '#ca4646';
                    exit = true;
                    badCalendar = true;
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
              let workingTime = {
                minutes : 0,
                hours : 0
              }
            for (let i = 1; i < numbOfRecords; i++) {
              let lateFlag = false;
              let records = userInfoAttendance[slctLi];
              let minimumArrival = loggedUserObject.settings.arrivalFromHours + loggedUserObject.settings.arrivalFromMinutes / 100;
              let maximumArrival = loggedUserObject.settings.arrivalToHours + loggedUserObject.settings.arrivalToMinutes / 100;
              let arrivalTime = records[i].date.getHours() + records[i].date.getMinutes() / 100;
              if(records[i].action === 'arrival' && arrivalTime > minimumArrival && arrivalTime < maximumArrival && loggedUserObject.settings.arrivalSwitch){
                lateFlag = true;
              }
              if (records[i + 1] !== undefined && records[i].action === 'arrival' && records[i + 1].action === 'departure') {
                let minuteDif = (Math.trunc(records[i + 1].date.getTime() / 60000) - Math.trunc(records[i].date.getTime() / 60000));
                workingTime.minutes += minuteDif;
                workingTime.hours += Math.trunc(minuteDif / 60);
                document.getElementById('userInfoTableBody').insertAdjacentHTML('beforeend', `
                         <tr>
                           ${`${lateFlag == true ? '<td class="donut">' : '<td>'}` + `${records[i].from == 'PC' ? '(PC) ' : ''}` + records[i].date.getHours() + ':' + `${records[i].date.getMinutes()}`.padStart(2, '0') + `${records[i].type.length != 0 ? (' - ' + records[i].type) : ''}`}</td>
                           <td>${`${records[i + 1].from == 'PC' ? '(PC) ' : ''}` + records[i + 1].date.getHours() + ':' + `${records[i + 1].date.getMinutes()}`.padStart(2, '0') + `${records[i + 1].type.length != 0 ? (' - ' + records[i + 1].type) : ''}`}</td>
                           <td>${`${Math.trunc(minuteDif / 60) != 0 ? (Math.trunc(minuteDif / 60) + 'h ') : ''}` + (minuteDif % 60) + 'm'}</td>
                         </tr>
                         `);
                i++;
              } else {
                if (records[i].action === 'arrival') {
                  let inWorkFlag = false;
                  let date3 = new Date();
                  let date4 = records[i].date;
                  if((i + 1) === numbOfRecords && date3.getFullYear() === date4.getFullYear() && date3.getMonth()	 === date4.getMonth() && date3.getDate() === date4.getDate()){
                    inWorkFlag = true;
                  }
                  document.getElementById('userInfoTableBody').insertAdjacentHTML('beforeend', `
                           <tr>
                             ${`${lateFlag == true ? '<td class="donut">' : '<td>'}` + `${records[i].from == 'PC' ? '(PC) ' : ''}` + records[i].date.getHours() + ':' + `${records[i].date.getMinutes()}`.padStart(2, '0') + `${records[i].type.length != 0 ? (' - ' + records[i].type) : ''}`}</td>
                             ${inWorkFlag == true ? '<td class="green">in work' : '<td class="donut">'}</td>
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

            if(numbOfRecords > 1){
              let date3 = new Date();
              let date4 = userInfoAttendance[slctLi][1].date;
              let workingTimeRed = '<td>';
              if(loggedUserObject.settings.MWTHours * 60 + loggedUserObject.settings.MWTMinutes > workingTime.minutes && loggedUserObject.settings.MWTSwitch){
                if(!(date3.getFullYear() === date4.getFullYear() && date3.getMonth()	 === date4.getMonth() && date3.getDate() === date4.getDate())){
                   workingTimeRed = '<td class="donut">'
                }
              }
              document.getElementById('userInfoTableBody').insertAdjacentHTML('beforeend', `
                       <tr>
                         <td></td>
                         <td>Total :</td>
                         ${workingTimeRed} ${(workingTime.hours != 0 ? workingTime.hours + 'h ' : '') + workingTime.minutes % 60 + 'm'}</td>
                       </tr>
                       `);
            }

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
    if(badCalendar){
      document.getElementById('userInfoBackToCalendar').src = "calendar-triangle.svg";
    } else {
      document.getElementById('userInfoBackToCalendar').src = "calendar.svg";
    }
    callback();
  });
}

function setNumberInputWatchdog(mainElement, focusElement, typeOfElement) {
  let compareNumber = 0;
  if(typeOfElement === 'hours'){
    compareNumber = 23;
  } else if (typeOfElement === 'minutes') {
    compareNumber = 59;
  } else {
    return console.log('wrong typeOfElement input');
  }
  document.getElementById(mainElement).oninput  = function() {
  setTimeout(() => {
    let value = document.getElementById(mainElement).value;
      let i = -1;
      while(Number(value) > compareNumber || Number(value) == NaN || value.length > 2){
        value = value.slice(0, i);
        i--;
      }
      document.getElementById(mainElement).value = value;
      if(value.length === 2 && focusElement != undefined) {
        document.getElementById(focusElement).focus();
      }
  },100);
  }
}

function applyNumberInputWatchdog(){
  const numberInputElements = [
    ['userInfoDateBackHours', 'userInfoDateBackMinutes', 'hours'],
    ['userInfoDateBackMinutes', 'userInfoDateBackType', 'minutes'],
    ['userInfoSettingsArrivalFromHours', 'userInfoSettingsArrivalFromMinutes', 'hours'],
    ['userInfoSettingsArrivalFromMinutes', 'userInfoSettingsArrivalToHours', 'minutes'],
    ['userInfoSettingsArrivalToHours', 'userInfoSettingsArrivalToMinutes', 'hours'],
    ['userInfoSettingsArrivalToMinutes', 'userInfoSettingsMWTHours', 'minutes' ],
    ['userInfoSettingsMWTHours', 'userInfoSettingsMWTMinutes', 'hours'],
    ['userInfoSettingsMWTMinutes', undefined, 'minutes']
  ]

 numberInputElements.forEach((constInpElm) => {
  setNumberInputWatchdog(constInpElm[0], constInpElm[1], constInpElm[2]);
 });
}

document.getElementById('userInfoBackToCalendar').onclick = function () {
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


function fillUserInfo(userObj) {
  document.getElementById('userInfoProfilePicture').src = userObj.img;
  document.getElementById('userInfoProfilePicture').style.display = 'inline-block';
  document.getElementById('userInfoFirstName').value = userObj.firstName;
  document.getElementById('userInfoLastName').value = userObj.lastName;
  document.getElementById('userInfoEmail').value = userObj.email;
  document.getElementById('userInfoCardUID').value = userObj.cardUID;
  if(userObj.note == ""){
    document.getElementById('userInfoEmployeeNote').placeholder = 'Notes for employee';
  } else {
    document.getElementById('userInfoEmployeeNote').value = userObj.note;
  }
  if (userObj.role) {
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

document.getElementById('userInfoCalSetting').onclick = function() {
  showShadow();
  document.getElementsByClassName('beforeShadow')[1].style.display = 'flex';
  document.getElementById('userInfoSettingsArrivalFromHours').focus();
}


document.getElementById('userInfoLateArrivalTrue').onclick = function() {
  this.style.display = 'none';
  document.getElementById('userInfoLateArrivalFalse').style.display = 'flex'
  document.getElementById('userInfoSettingsArrivalFromHours').setAttribute('disabled', "");
  document.getElementById('userInfoSettingsArrivalFromMinutes').setAttribute('disabled', "");
  document.getElementById('userInfoSettingsArrivalToHours').setAttribute('disabled', "");
  document.getElementById('userInfoSettingsArrivalToMinutes').setAttribute('disabled', "");

}
document.getElementById('userInfoLateArrivalFalse').onclick = function() {
  this.style.display = 'none';
  document.getElementById('userInfoLateArrivalTrue').style.display = 'flex';
  document.getElementById('userInfoSettingsArrivalFromHours').removeAttribute('disabled');
  document.getElementById('userInfoSettingsArrivalFromMinutes').removeAttribute('disabled');
  document.getElementById('userInfoSettingsArrivalToHours').removeAttribute('disabled');
  document.getElementById('userInfoSettingsArrivalToMinutes').removeAttribute('disabled');

}


document.getElementById('userInfoMWTTrue').onclick = function() {
  this.style.display = 'none';
  document.getElementById('userInfoMWTFalse').style.display = 'flex';
  document.getElementById('userInfoSettingsMWTHours').setAttribute('disabled', "");
  document.getElementById('userInfoSettingsMWTMinutes').setAttribute('disabled', "");
}
document.getElementById('userInfoMWTFalse').onclick = function() {
  this.style.display = 'none';
  document.getElementById('userInfoMWTTrue').style.display = 'flex'
  document.getElementById('userInfoSettingsMWTHours').removeAttribute('disabled');
  document.getElementById('userInfoSettingsMWTMinutes').removeAttribute('disabled');
}


document.getElementById('userInfoSettingsSave').onclick = function() {
  let objToSend = {
    _id: loggedUserObject._id,
    arrivalSwitch: document.getElementById('userInfoLateArrivalFalse').style.display === 'none'
      ? true
      : false,
    arrivalFromHours: document.getElementById('userInfoSettingsArrivalFromHours').value,
    arrivalFromMinutes: document.getElementById('userInfoSettingsArrivalFromMinutes').value,
    arrivalToHours: document.getElementById('userInfoSettingsArrivalToHours').value,
    arrivalToMinutes: document.getElementById('userInfoSettingsArrivalToMinutes').value,
    MWTSwitch: document.getElementById('userInfoMWTFalse').style.display === 'none'
      ? true
      : false,
    MWTHours: document.getElementById('userInfoSettingsMWTHours').value,
    MWTMinutes: document.getElementById('userInfoSettingsMWTMinutes').value,
  }
  let check = true;

  if (objToSend.arrivalFromHours) {
    document.getElementById('userInfoSettingsArrivalFromHours').style.background = 'white';
  } else {
    document.getElementById('userInfoSettingsArrivalFromHours').style.background = '#f8d2d2';
    check = false;
  }

  if (objToSend.arrivalFromMinutes) {
    document.getElementById('userInfoSettingsArrivalFromMinutes').style.background = 'white';
  } else {
    document.getElementById('userInfoSettingsArrivalFromMinutes').style.background = '#f8d2d2';
    check = false;
  }

  if (objToSend.arrivalToHours) {
    document.getElementById('userInfoSettingsArrivalToHours').style.background = 'white';
  } else {
    document.getElementById('userInfoSettingsArrivalToHours').style.background = '#f8d2d2';
    check = false;
  }

  if (objToSend.arrivalToMinutes) {
    document.getElementById('userInfoSettingsArrivalToMinutes').style.background = 'white';
  } else {
    document.getElementById('userInfoSettingsArrivalToMinutes').style.background = '#f8d2d2';
    check = false;
  }

  if (objToSend.MWTHours) {
    document.getElementById('userInfoSettingsMWTHours').style.background = 'white';
  } else {
    document.getElementById('userInfoSettingsMWTHours').style.background = '#f8d2d2';
    check = false;
  }

  if (objToSend.MWTMinutes) {
    document.getElementById('userInfoSettingsMWTMinutes').style.background = 'white';
  } else {
    document.getElementById('userInfoSettingsMWTMinutes').style.background = '#f8d2d2';
    check = false;
  }

  objToSend.arrivalFromHours = Number(objToSend.arrivalFromHours);
  objToSend.arrivalFromMinutes = Number(objToSend.arrivalFromMinutes);
  objToSend.arrivalToHours = Number(objToSend.arrivalToHours);
  objToSend.arrivalToMinutes = Number(objToSend.arrivalToMinutes);
  objToSend.MWTHours = Number(objToSend.MWTHours);
  objToSend.MWTMinutes = Number(objToSend.MWTMinutes);
  if (check === false) {
    return;
  } else {

    var xhr = new XMLHttpRequest();
    xhr.withCredentials = true;
    xhr.addEventListener("readystatechange", function() {
      if (this.readyState === 4) {
        let status = xhr.getResponseHeader('x-status');
        if (status === "ok") {
          loggedUserObject.settings.arrivalSwitch = objToSend.arrivalSwitch;
          loggedUserObject.settings.arrivalFromHours = objToSend.arrivalFromHours;
          loggedUserObject.settings.arrivalFromMinutes = objToSend.arrivalFromMinutes;
          loggedUserObject.settings.arrivalToHours = objToSend.arrivalToHours;
          loggedUserObject.settings.arrivalToMinutes = objToSend.arrivalToMinutes;
          loggedUserObject.settings.MWTSwitch = objToSend.MWTSwitch;
          loggedUserObject.settings.MWTHours = objToSend.MWTHours;
          loggedUserObject.settings.MWTMinutes = objToSend.MWTMinutes;
          userInfoCreateCalendar(slctMonth, () => {
            document.getElementById('contentShadow').click();
            if(document.getElementById('userInfoCalendar').style.display === 'none'){
              document.getElementById('userInfoCalMonth').children[slctLi].click();
            }
          });
        } else {
          alert(status);
        }
      }
    });

    xhr.open("POST", postURL + '/calendarsettings');
    xhr.setRequestHeader("content-type", "application/json");
    xhr.setRequestHeader("cache-control", "no-cache");
    xhr.send(JSON.stringify(objToSend));
  }
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


document.getElementById('userInfoInsertDateBack').onclick = function() {

let type = document.getElementById('userInfoDateBackType').value;
if(type.length > 12) {
  alert('Maximum note length is 12 characters');
  return;
}

let check = false;
if (document.getElementById('userInfoDateBackHours').value) {
  document.getElementById('userInfoDateBackHours').style.background = 'white';
} else {
  document.getElementById('userInfoDateBackHours').style.background = '#f8d2d2';
  check = true;
}

if (document.getElementById('userInfoDateBackMinutes').value) {
  document.getElementById('userInfoDateBackMinutes').style.background = 'white';
} else {
  document.getElementById('userInfoDateBackMinutes').style.background = '#f8d2d2';
  check = true;
}

if(check){
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
                   userInfoAttendance[slctLi][0].overlap,
                   Number(document.getElementById('userInfoDateBackHours').value),
                   Number(document.getElementById('userInfoDateBackMinutes').value),
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

document.getElementById('userInfoDeleteUser').onclick = function() {
  showShadow();
  document.getElementById('removeDecisionContent').innerHTML = `Are you sure you want to delete ${setUserObj.firstName
  + ' ' + setUserObj.lastName} with all attendance from your database? You cannot undo this action.`;
  document.getElementsByClassName('beforeShadow')[2].style.display = 'flex';
}

document.getElementById('userInfoCancelRemoveUser').onclick = function() {
  document.getElementById('contentShadow').click();
}

document.getElementById('userInfoRemoveUser').onclick = function() {
  var xhr = new XMLHttpRequest();
  xhr.withCredentials = true;
  xhr.addEventListener("readystatechange", function() {
    if (this.readyState === 4) {
      let status = xhr.getResponseHeader('x-status');
      if (status === 'ok') {
        document.getElementById('employees').click();
      } else {
        alert(status);
      }
    }
  });
  xhr.open("POST", postURL + "/deleteuser");
  xhr.setRequestHeader("content-type", "application/json");
  xhr.setRequestHeader("cache-control", "no-cache");
  xhr.send(JSON.stringify({_id: setUserObj._id}));
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
      role: document.getElementById('userInfoRole').checked
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

      let tempUserObj = setUserObj;
      delete tempUserObj.img;
      console.log(objToSend,tempUserObj);
      if (JSON.stringify(objToSend) === JSON.stringify(tempUserObj)) {
        document.getElementById('userInfoFirstName').setAttribute('disabled', "");
        document.getElementById('userInfoLastName').setAttribute('disabled', "");
        document.getElementById('userInfoEmail').setAttribute('disabled', "");
        document.getElementById('userInfoCardUID').setAttribute('disabled', "");
        document.getElementById('userInfoRole').setAttribute('disabled', "");
        document.getElementsByClassName('slider')[0].style.cursor = 'default';
        document.getElementById('userInfoEdit').innerHTML = 'Edit';
        return;
      }

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

document.getElementById('userInfoEmployeeNote').oninput = function(){
  if(document.getElementById('userInfoEmployeeNote').value != setUserObj.note){
    document.getElementById('userInfoSaveNote').style.opacity = '1';
  } else {
    document.getElementById('userInfoSaveNote').style.opacity = '0.5';
  }
}

document.getElementById('userInfoSaveNote').onclick = function() {
  let textareaVal = document.getElementById('userInfoEmployeeNote').value;
  if (textareaVal === ""){
    document.getElementById('userInfoEmployeeNote').placeholder = 'Notes for employee';
  }
  if(textareaVal !== setUserObj.note){
    var xhr = new XMLHttpRequest();
    xhr.withCredentials = true;
    xhr.addEventListener("readystatechange", function() {
      if (this.readyState === 4) {
        let status = xhr.getResponseHeader('x-status');
        if (status === 'ok') {
          setUserObj.note = textareaVal;
          document.getElementById('userInfoSaveNote').style.opacity = '0.5';
        } else {
          alert(status);
        }
      }
    });
    xhr.open("POST", postURL + "/editnote");
    xhr.setRequestHeader("content-type", "application/json");
    xhr.setRequestHeader("cache-control", "no-cache");
    xhr.send(JSON.stringify({
      _id: setUserObj._id,
      note: textareaVal
    }));
  }
}

applyNumberInputWatchdog();
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
fillUserInfo(setUserObj);
fillUserInfoSettings();
