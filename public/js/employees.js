var accounts;

function fillTable() {
  document.getElementById('table').innerHTML = ''; //prevencia načítania tabuľky 2x po sebe
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  var xhr = new XMLHttpRequest();
  xhr.withCredentials = true;
  xhr.addEventListener("readystatechange", function() {
    if (this.readyState === 4) {
      if (xhr.getResponseHeader('x-status') === 'ok') {
      accounts = JSON.parse(xhr.response);
      for (let i = 0; i < accounts.length; i++) {
        var createdAt = new Date(1000 * parseInt(Number("0x" + accounts[i]._id.slice(0,8)), 10));
        document.getElementById('table').insertAdjacentHTML('beforeend', `
      <tr id='${accounts[i]._id}'>
        <td>&nbsp${accounts[i].firstName}</td>
        <td>${accounts[i].lastName}</td>
        <td>${accounts[i].email}</td>
        <td>${accounts[i].cardUID}</td>
        <td>${createdAt.getDate() + '. ' + monthNames[createdAt.getMonth()] + ' ' + createdAt.getFullYear()}</td>
        <td>${accounts[i].role}</td>
      </tr>
        `);
        document.getElementById(`${accounts[i]._id}`).onclick = function() {
          var xhr = new XMLHttpRequest();
          xhr.withCredentials = true;
          xhr.addEventListener("readystatechange", function() {
            if (this.readyState === 4) {
              var status = xhr.getResponseHeader('x-status');
              if (status === 'ok') {
                var seasonDate = new Date();
                localStorage.setItem('user_id', accounts[i]._id);
                localStorage.setItem('season', (1 + seasonDate.getMonth()) + '-' +  seasonDate.getFullYear());
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
      document.getElementById('accTable').style.visibility = 'visible';
    } else {

    }
    }
  });

  xhr.open("POST", postURL + '/getaccounts');
  xhr.setRequestHeader("cache-control", "no-cache");
  xhr.send();
}

document.getElementById('filterIcon').onclick = function() {
  document.getElementById('contentShadow').style.zIndex = 1;
  document.getElementById('filter').style.zIndex = 1;
}

document.getElementById('contentShadow').onclick = function() {
  document.getElementById('contentShadow').style.zIndex = (-1);
  document.getElementById('filter').style.zIndex = (-1);
}

fillTable();
