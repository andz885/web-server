var attendance;

function fillGraph(monthShift) {
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  for (var i = 0; i < 31; i++) { //clear previous
    document.getElementById('chart').innerHTML = '';
  }
  for (let i = 0; i < 31; i++) {
    document.getElementById('chart').insertAdjacentHTML('beforeend', `
      <div class="row">
      <div id="weekDays${i}"></div>
      <div id="day${i}"></div>
      <div id="line${i}"></div>
      </div>`);
  }
  var date = new Date();
  var year = date.getFullYear();
  var month = date.getMonth() + monthShift;
  var firstDay = new Date(year, month, 1);
  x = firstDay.getDay();
  var lastDay = new Date(year, month + 1, 0);
  for (let i = 0; i < lastDay.getDate(); i++) {
    document.getElementById("weekDays" + i).innerHTML = WEEKDAYS[(x) % 7];
    x++;
    document.getElementById("day" + i).innerHTML = i + 1;
  }
  document.getElementById('attDate').innerHTML = monthNames[((month % 12) + 12) % 12] + ' ' + lastDay.getFullYear();

var xhr = new XMLHttpRequest();
xhr.withCredentials = true;

xhr.addEventListener("readystatechange", function () {
  if (this.readyState === 4) {
    let attendance = JSON.parse(this.response);
    for(let i = 0; i < attendance.length; i++){
      if((attendance[i].action.split('-'))[0] === "arrival" && (attendance[i + 1].action.split('-'))[0] === "departure"){ // arrival and departure in row
        if((new Date (attendance[i].date)).getDate() === (new Date (attendance[i + 1].date)).getDate()) { // arrival and departure in the same day
          let startDate = new Date (attendance[i].date);
          let endDate = new Date (attendance[i + 1].date);
          document.getElementById("line" + (startDate.getDate() - 1 )).insertAdjacentHTML('beforeend', `<span id = ${'bar'+ i}></span>`);
          document.getElementById('bar' + i).style.background = '#35ad5c';
          document.getElementById('bar' + i).style.width = ((endDate.getTime() - startDate.getTime()) / 120000) + 'px';
          document.getElementById('bar' + i).style.left = ((startDate.getHours() * 60 + startDate.getMinutes() + (startDate.getSeconds > 30 ? 1 : 0))/2) + 'px';
          i++;  //skip departure record
        } else if(((new Date (attendance[i].date)).getDate() + 1) === (new Date (attendance[i + 1].date)).getDate()){ //arrival and departure in day after
          let startDate = new Date (attendance[i].date);
          let endDate = new Date (attendance[i + 1].date);
          document.getElementById("line" + (startDate.getDate() - 1 )).insertAdjacentHTML('beforeend', `<span id = ${'bar'+ i}></span>`);
          document.getElementById("line" + startDate.getDate()).insertAdjacentHTML('beforeend', `<span id = ${'bar'+ (i + 1)}></span>`);
          document.getElementById('bar' + i).style.background = '#35ad5c';
          document.getElementById('bar' + i).style.width = (720 - ((startDate.getHours() * 60 + startDate.getMinutes() + (startDate.getSeconds > 30 ? 1 : 0))/2)) + 'px';
          document.getElementById('bar' + i).style.left = ((startDate.getHours() * 60 + startDate.getMinutes() + (startDate.getSeconds > 30 ? 1 : 0))/2) + 'px';
          document.getElementById('bar' + (i + 1)).style.background = '#35ad5c';
          document.getElementById('bar' + (i + 1)).style.width = ((endDate.getHours() * 60 + endDate.getMinutes() + (endDate.getSeconds > 30 ? 1 : 0))/2) + 'px';
          document.getElementById('bar' + (i + 1)).style.left = '0px';
          i++;  //skip departure record
        } else { // no departure found for arrival in next day
          let date = new Date (attendance[i].date);
          document.getElementById("line" + (date.getDate() - 1 )).insertAdjacentHTML('beforeend',
          `<span id = ${'bar'+ i}></span>`);
          document.getElementById('bar' + i).style.background = '#de5c5c';
          document.getElementById('bar' + i).style.width = '10px';
          if((attendance[i].action.split('-'))[0] === "departure")
          document.getElementById('bar' + i).style.left = (((date.getHours() * 60 + date.getMinutes() + (date.getSeconds > 30 ? 1 : 0))/2) -10) + 'px';
          else
          document.getElementById('bar' + i).style.left = ((date.getHours() * 60 + date.getMinutes() + (date.getSeconds > 30 ? 1 : 0))/2) + 'px';
        }
      } else { // two departures or arrivals in row
               let date = new Date (attendance[i].date);
               document.getElementById("line" + (date.getDate() - 1 )).insertAdjacentHTML('beforeend',
               `<span id = ${'bar'+ i}></span>`);
               document.getElementById('bar' + i).style.background = '#de5c5c';
               document.getElementById('bar' + i).style.width = '10px';
               if((attendance[i].action.split('-'))[0] === "departure")
               document.getElementById('bar' + i).style.left = (((date.getHours() * 60 + date.getMinutes() + (date.getSeconds > 30 ? 1 : 0))/2) -10) + 'px';
               else
               document.getElementById('bar' + i).style.left = ((date.getHours() * 60 + date.getMinutes() + (date.getSeconds > 30 ? 1 : 0))/2) + 'px';
              }
    }
    console.log(attendance);
  }
});

xhr.open("POST", postURL + '/getattendance');
xhr.setRequestHeader("content-type", "application/json");
xhr.setRequestHeader("cache-control", "no-cache");

xhr.send(JSON.stringify({
"user_id": "5be4de195a0a8211f8c5b4ac",
"season": (lastDay.getMonth() + 1) + "-" + lastDay.getFullYear()
}));
}

var selectedMonth = 0;

document.getElementById('attPrev').onclick = () => {
  selectedMonth--;
  fillGraph(selectedMonth);
}

document.getElementById('attNext').onclick = () => {
  selectedMonth++;
  fillGraph(selectedMonth);
}
