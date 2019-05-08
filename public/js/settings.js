
var avatarsArray = [
  "default.svg",
  "ripe-man.svg",
  "common-girl.svg",
  "beard-less-man.svg"
]

document.getElementById('changingAvatar').src = document.getElementById('avatar').src;

document.getElementById('changeAvatarNext').onclick = function() {
  let currentAvatarIndex = avatarsArray.indexOf(document.getElementById('changingAvatar').src.split('/')[3]);
  if(avatarsArray.length === currentAvatarIndex + 1){
    document.getElementById('changingAvatar').src = avatarsArray[0]
  } else {
    document.getElementById('changingAvatar').src = avatarsArray[currentAvatarIndex + 1];
  }
}

document.getElementById('changeAvatarPrev').onclick = function() {
  let currentAvatarIndex = avatarsArray.indexOf(document.getElementById('changingAvatar').src.split('/')[3]);
  if(currentAvatarIndex === 0){
    document.getElementById('changingAvatar').src = avatarsArray[avatarsArray.length - 1]
  } else {
    document.getElementById('changingAvatar').src = avatarsArray[currentAvatarIndex - 1];
  }
}

document.getElementById('changeAvatarButton').onclick = function() {
  var xhr = new XMLHttpRequest();
  xhr.withCredentials = true;
  let objToSend = {
    _id:loggedUserObject._id,
    img: document.getElementById('changingAvatar').src.split('/')[3]
  }
  xhr.addEventListener("readystatechange", function() {
    if (this.readyState === 4) {
      var status = xhr.getResponseHeader('x-status');
      if (status === 'ok') {
      document.getElementById('avatar').src = objToSend.img;
      } else {
        alert(status);
      }
    }
  });

  xhr.open("POST", postURL + '/changeavatar');
  xhr.setRequestHeader("content-type", "application/json");
  xhr.setRequestHeader("cache-control", "no-cache");
  xhr.send(JSON.stringify(objToSend));
}
