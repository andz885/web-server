function fillGraph(monthShift) {
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  for (var i = 0; i < 31; i++) {
    document.getElementById("day" + i).innerHTML = '';
  }
  var date = new Date();
  var year = date.getFullYear();
  var month = date.getMonth() + monthShift;
  var firstDay = new Date(year, month, 1);
  var lastDay = new Date(year, month + 1, 0);
  for (var i = 0; i < lastDay.getDate(); i++) {
    document.getElementById("day" + i).innerHTML = i+1;
    document.getElementById("line" + i).innerHTML = '<span></span>';
  }
  document.getElementById('attDate').innerHTML = monthNames[((month % 12) + 12) % 12] + ' ' + firstDay.getFullYear();
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
