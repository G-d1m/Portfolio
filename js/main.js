/* ------------------------------------------------------------------
   Starts the site and moves between the intro and the computer.

   Handy while working on it (add to the address):
     ?ch=3            the working channel is always 3
     ?skip=terminal   start at the terminal that asks for HI!
     ?skip=boot       start at the boot screen
     ?skip=login      start at the log in screen
     ?skip=desktop    start on the desktop
   ------------------------------------------------------------------ */

(function () {
  "use strict";

  var PF = window.PF;
  var params = new URLSearchParams(window.location.search);
  var skip = params.get("skip");
  var channel = Number(params.get("ch"));

  // The intro removes its two screens when it is over. A fresh copy of them is kept here
  // so the visitor can come back to the TV from the log in window.
  var introScreens = document.getElementById("stage-white").outerHTML + document.getElementById("stage-tv").outerHTML;
  var goingBack = false;

  function remove(selectors) {
    selectors.forEach(function (sel) {
      var node = document.querySelector(sel);
      if (node) node.remove();
    });
  }

  // Called by the terminal when the visitor types HI!
  PF.go = function (where) {
    if (where !== "os") return;
    var blackout = document.getElementById("blackout");
    var white = document.getElementById("stage-white");
    if (white) white.classList.add("crt-off");        // the picture switches off like a tube...
    setTimeout(function () {
      blackout.hidden = false;                        // ...then black
      remove(["#stage-white", "#stage-tv", "#blast"]);
      setTimeout(function () {
        PF.os.start();
        blackout.hidden = true;
      }, 700);
    }, 520);
  };

  // Called by the X on the log in window: the computer switches off and the TV is back, on a dead channel
  PF.backToTv = function () {
    if (goingBack) return;
    goingBack = true;
    var os = document.getElementById("stage-os");
    os.classList.add("crt-off");
    setTimeout(function () {
      PF.os.sleep();
      os.classList.remove("crt-off");
      os.insertAdjacentHTML("beforebegin", introScreens);
      PF.intro.start({ returning: true });
      goingBack = false;
    }, 520);
  };

  if (skip === "desktop" || skip === "login" || skip === "boot") {
    remove(["#stage-white", "#stage-tv", "#blast"]);
    if (skip === "desktop") PF.os.startAtDesktop();
    else if (skip === "login") PF.os.startAtLogin();
    else PF.os.start();
  } else if (skip === "terminal") {
    PF.intro.startAtTerminal();
  } else {
    PF.intro.start({ channel: channel >= 1 && channel <= 5 ? channel : 0 });
  }
})();
