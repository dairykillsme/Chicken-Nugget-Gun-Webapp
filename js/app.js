$(document).ready(function () {
  let Codes = {};
  const $StepTitle = $("#StepTitle");
  const $StepCode = $("#StepCode");
  const webSocket = new WebSocket("ws://192.168.0.27:81/", ["arduino"]);

  function InitializeUserLink() {
    $StepTitle.html("Enter Code to Initialize Neural Link");
    $StepCode.html(Codes.standbyCode);
  };

  function InitializeStandby() {
    $StepTitle.html("Chimpfkem Nunget Gun is in Standby");
    $StepCode.html("Awaiting Command");
  };
  

  $("#LaserSightEnable").on("click", function () {
    if ($(this).attr("data-status") === "off") {
      // websocket.send("LASERSIGHTON");
      console.log("LASERSIGHTON");
      $(this).text("Off").attr("data-status", "on")
      $("#LaserSightStatus").text("LASER SIGHT ON").toggleClass("text-success text-danger");
    } else {
      $("#LaserSightStatus").text("main.cpp:70:15: error: LaserSightDisable was not declared in this scope. ").toggleClass("text-success text-danger");
      Swal.fire({
        icon: "error",
        title: "FATAL ERROR: LaserSightDisable was not declared in this scope",
        text: "Disabling Laser Sight is not supported on your firmware version (v0.6.9). Please download the newest firmware from www.mcblackwater.com",
      });
    }
  });

  $("#ToggleMagazineLock").on("click", function () {
    if ($(this).attr("data-status") === "locked"){
      console.log("MAGLOCKOFF");
      // websocket.send("MAGLOCKOFF");
      $("#ToggleMagazineLock").text("Lock").attr("data-status", "unlocked");
      $("#MagazineStatus").text("MAGAZINE UNLOCKED").toggleClass("text-success text-danger");
    } else {
      console.log("MAGLOCKON");
      // websocket.send("MAGLOCKON");
      $("#ToggleMagazineLock").text("Unlock").attr("data-status", "locked");
      $("#MagazineStatus").text("MAGAZINE LOCKED").toggleClass("text-success text-danger");
    }
    // Send Magazine Toggle Code to Node MCU
  });

  $("#GenerateConsentCode").on("click", function () {
    $StepTitle.html("Waiting for target to enter Conset Code");
    $StepCode.html(Codes.consentCode);
    // Display Consent Code and Title on screen
  });

  $("#Calibrate").on ("click", function () {
    // webSocket.send("CALIBRATE");
    $StepTitle.html("Calibrating. This may take several hours.");
    $StepCode.html("Place on a level surface and do not disturb.");
    // Send Calibration Signal to Node MCU
  });
  
  if (webSocket.readyState === 1){
    console.log("Connected");
  }

  webSocket.onopen = function (event) {
  }

  webSocket.onmessage = function (event) {
    console.log(event.data);
    const messageArray = event.data.split(",");
    switch (messageArray[0]){
      case "CODES":
        Codes = {
          standbyCode: messageArray[1],
          reloadCode: messageArray[2],
          laserCode: messageArray[3],
          calibrationCode: messageArray[4],
          consentCode: messageArray[5]
        };
        InitializeUserLink();
        break;
      case "STNDBY":
        InitializeStandby();
        break;
    }
  };
});