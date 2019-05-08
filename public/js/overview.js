function employeesInWork(attArray) {
  let filteredArray = [];
  attArray.forEach(function(att) {
    if (!filteredArray.includes(att.user_id)) {
      filteredArray.push(att.user_id);
    }
  });

  for (let x = 0; x < filteredArray.length; x++) {
    filteredArray[x] = {
      _id: filteredArray[x]
    }
  }
  filteredArray.forEach(function(filtered) {
    let compareDate = 0;
    attArray.forEach(function(att) {
      if (filtered._id === att.user_id && (new Date(att.date)).getTime() > compareDate) {
        compareDate = (new Date(att.date)).getTime();
        filtered.action = att.action;
      }
    });
  });

  for (let x = filteredArray.length - 1; x >= 0; x--) {
    if (filteredArray[x].action === 'departure') {
      filteredArray.splice(x, 1);
    }
  }

  return filteredArray;
}

function thisDayAttendanceRequest(callback1) {
  var url = new URL(document.URL);
  var xhr = new XMLHttpRequest();
  xhr.withCredentials = true;
  xhr.addEventListener("readystatechange", function() {
    if (this.readyState === 4) {
      let status = xhr.getResponseHeader('x-status');
      if (status === 'ok') {
        callback1(JSON.parse(xhr.response));
      } else {
        alert(status);
      }
    }
  });
  xhr.open("GET", postURL + "/thisdayattendance");
  xhr.setRequestHeader("content-type", "application/json");
  xhr.setRequestHeader("cache-control", "no-cache");
  xhr.send();
}

function askForInWorkAccounts(callback2) {
  var xhr = new XMLHttpRequest();
  xhr.withCredentials = true;
  xhr.addEventListener("readystatechange", function() {
    if (this.readyState === 4) {
      if (xhr.getResponseHeader('x-status') === 'ok') {
        callback2(JSON.parse(xhr.response));
      } else {
        alert(xhr.getResponseHeader('x-status'));
      }
    }
  });
  xhr.open("GET", postURL + '/getaccounts');
  xhr.setRequestHeader("cache-control", "no-cache");
  xhr.send();
}

thisDayAttendanceRequest((att) => {
  let inWorkRecords = employeesInWork(att);
  if (inWorkRecords.length > 0) {
    askForInWorkAccounts((acc) => {
      inWorkRecords.forEach((rec) => {
        acc.forEach((account) => {
          if (account._id === rec._id) {
            rec.firstName = account.firstName;
            rec.lastName = account.lastName;
          }
        });
      });
      inWorkRecords.forEach((worker) => {
        document.getElementById('overviewInWorkTableBody').insertAdjacentHTML('beforeend', `
                 <tr>
                   <td>${'&nbsp&nbsp' + worker.firstName + '&nbsp&nbsp' + worker.lastName + '&nbsp&nbsp'}</td>
                 </tr>
                 `);
      });
    });
  }
});
