$(document).ready(function () {

  webSocket = new WebSocket("ws://192.168.0.27:81/", ["arduino"]);
  
  if (webSocket.readyState === 1){
    console.log("Connected");
  }

  webSocket.onopen = function (event) {
    setInterval(function(){
      webSocket.send("Poopoopeepee");
    }, 1000);
  }

  webSocket.onmessage = function (event) {
    console.log(event.data);
  };
});