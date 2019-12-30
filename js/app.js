$(document).ready(function () {
  let Codes = {};
  const $StepTitle = $("#StepTitle");
  const $StepCode = $("#StepCode");
  let webSocket = new WebSocket("ws://192.168.0.27:81/", ["arduino"]);
  let loadingInterval;

  let AlarmOne;
  let AlarmTwo;

  loadingInterval = setInterval(function () {
    switch ($StepCode.text()) {
      case "•":
        $StepCode.text("••");
        break;
      case "••":
        $StepCode.text("•••");
        break;
      case "•••":
        $StepCode.text("•");
        break;
    }
  }, 1000)

  setInterval(function(){
    console.info("WebSocket Status:", webSocket.readyState);
  },1000)

  function InitializeUserLink() {
    $StepTitle.html("Enter Code to Initialize Neural Link");
    $StepCode.html(Codes.standbyCode);
  };

  function InitializeStandby() {
    ShowControlPanel()
    $StepTitle.html("Chimpfkem Nunget Gun is in Standby");
    $StepCode.html("Awaiting Command .");
    loadingInterval = setInterval(function() {
      switch ($StepCode.text()){
        case "Awaiting Command .":
          $StepCode.text("Awaiting Command ..");
          break;
        case "Awaiting Command ..":
          $StepCode.text("Awaiting Command ...");
          break;
        case "Awaiting Command ...":
          $StepCode.text("Awaiting Command .");
          break;
      }
    },1000);
  };
  

  function ShowControlPanel() {
    $("#SectionLaserSight").removeClass("d-none").addClass("fadeInLeft");
    $("#SectionMagLock").removeClass("d-none").addClass("fadeInRight");
    $("#SectionConsentCode").removeClass("d-none").addClass("fadeInLeft");
    $("#SectionCalibrate").removeClass("d-none").addClass("fadeInRight");
  };

  ShowControlPanel()

  function AlarmsOn() {
    $(".alarm-flash, .alarm-light-wrapper-left, .alarm-light-wrapper-right").removeClass("d-none");
    anime({
      targets: ".alarm-flash",
      opacity: 0,
      loop: true,
      duration: 500,
      direction: "alternate",
      easing: "easeInOutSine"
    })
  }

  function InitializeFiringMode() {
    AlarmOne = new Audio("Alarm.mp3");
    AlarmTwo = new Audio("Alarm2.mp3");
    AlarmOne.play();
    AlarmTwo.loop = true;
    AlarmTwo.play();
    $StepTitle.html("CNG IS ARMED. READY TO FIRE");
    $StepCode.html("Someone boutta get it");
    AlarmsOn();
  }

  $("#LaserSightEnable").on("click", function () {
    clearInterval(loadingInterval);
    if ($(this).attr("data-status") === "off") {
      webSocket.send("LASERSIGHTON");
      console.log("LASERSIGHTON");
      $(this).text("Off").attr("data-status", "on")
      $("#LaserSightStatus").text("LASER SIGHT ON").toggleClass("text-success text-danger");
      $StepCode.html("Laser Sight On");
    } else {
      $("#LaserSightStatus").text("main.cpp:70:15: error: LaserSightDisable was not declared in this scope. ").removeClass("text-success").addClass("text-danger");
      $StepCode.html("main.cpp:70:15: error: LaserSightDisable was not declared in this scope. ");
      Swal.fire({
        icon: "error",
        title: "FATAL ERROR: LaserSightDisable was not declared in this scope",
        text: "Disabling Laser Sight is not supported on your firmware version (v0.6.9). Please download the newest firmware from www.mcblackwater.com",
      });
    }
  });

  $("#ToggleMagazineLock").on("click", function () {
    clearInterval(loadingInterval);
    $StepCode.html("Toggling Magazine");
    if ($(this).attr("data-status") === "locked"){
      console.log("MAGLOCKOFF");
      webSocket.send("MAGLOCKOFF");
      $("#ToggleMagazineLock").text("Lock").attr("data-status", "unlocked");
      $("#MagazineStatus").text("MAGAZINE UNLOCKED").toggleClass("text-success text-danger");
    } else {
      console.log("MAGLOCKON");
      webSocket.send("MAGLOCKON");
      $("#ToggleMagazineLock").text("Unlock").attr("data-status", "locked");
      $("#MagazineStatus").text("MAGAZINE LOCKED").toggleClass("text-success text-danger");
    }
    // Send Magazine Toggle Code to Node MCU
  });

  $("#GenerateConsentCode").on("click", function () {
    clearInterval(loadingInterval);
    $StepTitle.html("Waiting for target to enter Consent Code");
    $StepCode.html(Codes.consentCode);
    // Display Consent Code and Title on screen
  });

  $("#Calibrate").on("click", function () {
    clearInterval(loadingInterval);
    webSocket.send("CALIBRATE");
    $StepTitle.html("Calibrating. This may take several hours.");
    $StepCode.html("Place on a level surface and do not disturb.");
    // Send Calibration Signal to Node MCU
  });

  $("#AlarmsOn").on("click", function (){
    InitializeFiringMode();
  });

  $("#AlarmsOff").on("click", function () {
    AlarmOne.pause();
    AlarmTwo.pause();
  });

  webSocket.onopen = function (event) {
    clearInterval(loadingInterval);
    $StepTitle.html("Connected.");
    $StepCode.html("Awaiting Server Response");
  }

  webSocket.onclose = function (event) {
    webSocket = new WebSocket("ws://192.168.0.27:81/", ["arduino"]);
  }

  webSocket.onmessage = function (event) {
    console.log(event.data);
    const messageArray = event.data.split(",");
    switch (messageArray[0]){
      case "CODES":
        Codes = {
          standbyCode: messageArray[1],
          consentCode: messageArray[2]
        };
        InitializeUserLink();
        break;
      case "STNDBY":
        InitializeStandby();
        break;
      case "CONSENT":
        InitializeFiringMode();
        break
    }
  };
});