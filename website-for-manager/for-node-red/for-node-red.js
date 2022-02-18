// For Node-Red Web Socket
var ws;
var wsUri = "ws:";
var loc = window.location;
console.log(loc);
if (loc.protocol === "https:") {
  wsUri = "wss:";
}
// This needs to point to the web socket in the Node-RED flow
wsUri += "//" + loc.host + loc.pathname.replace("manager", "ws/manager");

function wsConnect() {
  console.log("connect", wsUri);
  ws = new WebSocket(wsUri);
  //var line = "";    // either uncomment this for a building list of messages
  ws.onmessage = function (msg) {
    var line = ""; // or uncomment this to overwrite the existing message
    // parse the incoming message as a JSON object
    var data = msg.data;
    console.log(data);
    // build the output from the topic and payload parts of the object
    line += "<p>" + data + "</p>";
    // replace the messages div with the new "line"
    // document.getElementById('messages').innerHTML = line;
    //ws.send(JSON.stringify({data:data}));
  };
  ws.onopen = function () {
    // update the status div with the connection status
    // document.getElementById('status').innerHTML = "connected";
    //ws.send("Open for data");
    console.log("connected");
  };
  ws.onclose = function () {
    // update the status div with the connection status
    // document.getElementById('status').innerHTML = "not connected";
    // in case of lost connection tries to reconnect every 3 secs
    setTimeout(wsConnect, 3000);
  };
}
////////
var areaCount = 8;
var redColor = "#ff0000";
var greenColor = "#00c700";
var blueColor = "#009dff";
var defaultColor = "#d3d3d3";
updateSectionCount();

function changeColor(color) {
  for (var i = 1; i <= areaCount; i++) {
    var id = "r" + i;
    var area = "A0" + i;
    if (document.getElementById(id).checked) {
      document.getElementById(area).style.backgroundColor = color;
      document.getElementById(id).checked = false;
    }
  }
  //   var x = document.getElementById("snackbar");
  //   snackbar.className = "hide";
  //   setTimeout(function () {
  //     snackbar.className = snackbar.className.replace("hide", "");
  //   }, 500);
  updateSectionCount();
  sendToNodered();
}

function selectSpot() {
  var check = 0;
  var x = document.getElementById("snackbar");
  for (var i = 1; i <= areaCount; i++) {
    var id = "r" + i;
    if (document.getElementById(id).checked) {
      check = 1;
    }
  }
  //   if (check == 1) {
  //     document.getElementsByClassName("choose-message")[0].style.display = "none";
  //     document.getElementsByClassName("color")[0].style.display = "block";
  //   } else {
  //     document.getElementsByClassName("choose-message")[0].style.display =
  //       "block";
  //     document.getElementsByClassName("color")[0].style.display = "none";
  //   }
}

function updateSectionCount() {
  var countArr = [0, 0, 0, 0, 0, 0, 0];
  for (var i = 1; i <= areaCount; i++) {
    var area = "A0" + i;
    var backgroundColor = document.getElementById(area).style.backgroundColor;
    var hex = rgbToHex(backgroundColor);
    if (hex == redColor) {
      countArr[0]++;
    } else if (hex == greenColor) {
      countArr[1]++;
    } else if (hex == blueColor) {
      countArr[2]++;
    } else {
      countArr[3]++;
    }
  }
  document.getElementsByClassName("number-red")[0].innerHTML = countArr[0];
  document.getElementsByClassName("number-green")[0].innerHTML = countArr[1];
  document.getElementsByClassName("number-blue")[0].innerHTML = countArr[2];
  document.getElementsByClassName("number-default")[0].innerHTML = countArr[3];
  document.getElementsByClassName("number-total")[0].innerHTML = areaCount;
}

function rgbToHex(rgbType) {
  var rgb = rgbType.replace(/[^%,.\d]/g, "").split(",");

  rgb.forEach(function (str, x, arr) {
    if (str.indexOf("%") > -1) str = Math.round(parseFloat(str) * 2.55);
    str = parseInt(str, 10).toString(16);
    if (str.length === 1) str = "0" + str;
    arr[x] = str;
  });
  return "#" + rgb.join("");
}

function openPalette() {
  var paletteStyle = document.getElementsByClassName("color-palette")[0].style;
  var snackbar = document.getElementById("snackbar");
  var modeIcon = document.getElementById("mode-icon");

  if (paletteStyle.maxHeight) {
    paletteStyle.maxHeight = null;
    for (var i = 1; i <= areaCount; i++) {
      var inputId = "r" + i;
      var labelId = "A0" + i;
      document.getElementById(inputId).disabled = true;
      document.getElementById(inputId).checked = false;
      document.getElementById(labelId).className = "viewmode col";
    }
    document.getElementsByClassName("snackbar-item")[0].innerHTML =
      "<i class='fa fa-eye'></i> View Mode";
    snackbar.className = "show";
    setTimeout(function () {
      snackbar.className = snackbar.className.replace("show", "");
    }, 3000);
    modeIcon.className = "fa fa-eye";
  } else {
    paletteStyle.maxHeight =
      document.getElementsByClassName("color-palette")[0].scrollHeight + "px";
    for (var i = 1; i <= areaCount; i++) {
      var inputId = "r" + i;
      var labelId = "A0" + i;
      document.getElementById(inputId).disabled = false;
      document.getElementById(labelId).className = "whatever col";
    }
    document.getElementsByClassName("snackbar-item")[0].innerHTML =
      "<i class='fa fa-edit'></i> Color Setting Mode";
    snackbar.className = "show";
    setTimeout(function () {
      snackbar.className = snackbar.className.replace("show", "");
    }, 3000);
    modeIcon.className = "fa fa-edit";
  }
}

function reset() {
  for (var i = 1; i <= areaCount; i++) {
    var id = "r" + i;
    var area = "A0" + i;
    document.getElementById(area).style.backgroundColor = "#d3d3d3";
    document.getElementById(id).checked = false;
  }
  updateSectionCount();
}

function sendToNodered() {
  var areaArr = [];
  for (var i = 1; i <= areaCount; i++) {
    var area = "A0" + i;
    var backgroundColor = document.getElementById(area).style.backgroundColor;
    var hex = rgbToHex(backgroundColor);
    if (hex == redColor) {
      areaArr[i - 1] = 1;
    } else if (hex == greenColor) {
      areaArr[i - 1] = 2;
    } else if (hex == blueColor) {
      areaArr[i - 1] = 3;
    } else {
      areaArr[i - 1] = 0;
    }
  }
  var sendmsg = areaArr.join(" ");
  if (ws) {
    ws.send(sendmsg);
  }
}
