//
//

var daySelected = null;

function fillCalendar(monthShift) {
  var date = new Date();
  var year = date.getFullYear();
  var month = date.getMonth() + monthShift;
  var firstDay = new Date(year, month, 1);
  var lastDay = new Date(year, month + 1, 0);
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  document.getElementById('calDate').innerHTML = monthNames[((month % 12) + 12) % 12] + ' ' + firstDay.getFullYear();
  var monthChildrens = document.getElementById("month").children;
  for (var i = 0; i < 42; i++){
    monthChildrens[i].innerHTML = '';
    monthChildrens[i].classList.remove('no-hover');
    monthChildrens[i].classList.remove('unselectable');
    document.getElementById("month").children[i].onclick = function() {};
  }
  var dayDate = 1;
  var from = firstDay.getDay();
  if(from === 0) from = 7;
  from--;
  var to = lastDay.getDate() + from;
  // debugger;
  for (from; from < to; from++) {
    monthChildrens[from].innerHTML = dayDate;
    if((dayDate > date.getDate() && monthShift === 0) || monthShift > 0){
      monthChildrens[from].classList.add('no-hover');
      monthChildrens[from].classList.add('unselectable');
    } else {
      document.getElementById("month").children[from].onclick = function() {
      document.getElementById("date").value = this.innerHTML + ' ' + document.getElementById("calDate").innerHTML;
     }
    }
    dayDate++;
  }
}

var selectedMonth = 0;

document.getElementById('calPrev').onclick = () => {
  if(selectedMonth > -6) selectedMonth--;
  fillCalendar(selectedMonth);
}

document.getElementById('calNext').onclick = () => {
  if(selectedMonth < 6) selectedMonth++;
  fillCalendar(selectedMonth);
}


fillCalendar(selectedMonth);
