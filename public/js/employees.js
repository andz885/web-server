var accounts;

function askForAccounts(callback) {
  var xhr = new XMLHttpRequest();
  xhr.withCredentials = true;
  xhr.addEventListener("readystatechange", function() {
    if (this.readyState === 4) {
      if (xhr.getResponseHeader('x-status') === 'ok') {
        callback(JSON.parse(xhr.response));
        let errTable = document.getElementById('accTable');
        if (errTable !== null) {
          document.getElementById('accTable').style.visibility = 'visible';
        }
      } else {
        alert(xhr.getResponseHeader('x-status'));
      }
    }
  });
  xhr.open("GET", postURL + '/getaccounts');
  xhr.setRequestHeader("cache-control", "no-cache");
  xhr.send();
}

function fillTable(records){
  document.getElementById('table').innerHTML = ''; //prevencia načítania tabuľky 2x po sebe
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
    for (let i = 0; i < records.length; i++) {
      var createdAt = new Date(1000 * parseInt(Number("0x" + records[i]._id.slice(0,8)), 10));
      records[i].createdAt = createdAt.getDate() + '. ' + monthNames[createdAt.getMonth()] + ' ' + createdAt.getFullYear();
      document.getElementById('table').insertAdjacentHTML('beforeend', `
    <tr id='${records[i]._id}'>
      <td>&nbsp&nbsp${records[i].firstName}</td>
      <td>&nbsp&nbsp${records[i].lastName}</td>
      <td>&nbsp&nbsp${records[i].email}</td>
      <td>&nbsp&nbsp${records[i].cardUID}</td>
      <td>&nbsp&nbsp${records[i].createdAt}</td>
      <td>&nbsp&nbsp${records[i].role}</td>
    </tr>
      `);
      document.getElementById(`${records[i]._id}`).onclick = function() {
        var xhr = new XMLHttpRequest();
        xhr.withCredentials = true;
        xhr.addEventListener("readystatechange", function() {
          if (this.readyState === 4) {
            var status = xhr.getResponseHeader('x-status');
            if (status === 'ok') {
              localStorage.setItem('user_id', records[i]._id);
              document.getElementById('content').innerHTML = xhr.response;
              loadScript('/userinfo.js', () => {});
            } else {
              alert(status);
            }
          }
        });
        xhr.open("GET", postURL + "/userinfo");
        xhr.setRequestHeader("content-type", "application/json");
        xhr.setRequestHeader("cache-control", "no-cache");
        xhr.send();
      }
    }
}

function sortByName(records, property){
  var direction = 0;
  records.sort(function(a, b){
    if(a[property] < b[property]) { direction = 1; return 1; }
    if(a[property] > b[property]) { return -1; }
    return 0;
  });
  if(direction){
    records.sort(function(a, b){
      if(a[property] < b[property]) { return -1; }
      if(a[property] > b[property]) { return 1; }
      return 0;
    });
  }
}

function Numb(arg) {
 if(arg === true) { return 1;}
 if(arg === false) { return 0; }
 return arg;
}

function sortByNumber(records, property) {
  var direction = 0;
  records.sort(function(a, b) {
    if ((Numb(b[property]) - Numb(a[property])) < 0) {
      direction = 1
    }
    return Numb(a[property]) - Numb(b[property]);
  });
  if (direction) {
    records.sort(function(a, b) {
      return Numb(b[property]) - Numb(a[property]);
    })
  }
}

function NumbHex(arg){
  return parseInt(arg,16);
}

function sortByNumberHex(records, property) {
  var direction = 0;
  records.sort(function(a, b) {
    if ((NumbHex(b[property]) - NumbHex(a[property])) < 0) {
      direction = 1
    }
    return NumbHex(a[property]) - NumbHex(b[property]);
  });
  if (direction) {
    records.sort(function(a, b) {
      return NumbHex(b[property]) - NumbHex(a[property]);
    })
  }
}

function DateToNumb(arg){
  let date = new Date(1000 * parseInt(Number("0x" + arg.slice(0,8)), 10));
  return date.getTime();
}

function sortByDate(records, property) {
  var direction = 0;
  records.sort(function(a, b) {
    if ((DateToNumb(b[property]) - DateToNumb(a[property])) < 0) {
      direction = 1
    }
    return DateToNumb(a[property]) - DateToNumb(b[property]);
  });
  if (direction) {
    records.sort(function(a, b) {
      return DateToNumb(b[property]) - DateToNumb(a[property]);
    })
  }
}

// document.getElementById('filterIcon').onclick = function() {
//   showShadow();
// }


document.getElementById('tableFirstName').onclick = function() {
sortByName(accounts, 'firstName');
fillTable(accounts);
}

document.getElementById('tableLastName').onclick = function() {
sortByName(accounts, 'lastName');
fillTable(accounts);
}

document.getElementById('tableEmail').onclick = function() {
sortByName(accounts, 'email');
fillTable(accounts);
}

document.getElementById('tableCardUID').onclick = function() {
sortByNumberHex(accounts, 'cardUID');
fillTable(accounts);
}

document.getElementById('tableCreatedAt').onclick = function() {
sortByDate(accounts, '_id');
fillTable(accounts);
}

document.getElementById('tableAdmin').onclick = function() {
sortByNumber(accounts, 'role');
fillTable(accounts);
}

askForAccounts((rec) => {
  fillTable(rec);
  accounts = rec;
});
