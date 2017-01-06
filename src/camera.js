

// Our own camera offset object
// Mainly to watch the planet go by from a point of view.
// also used to not have to center the planet each time
var cameraOffset = {
  x: 0,
  y: 0
};

var zoomAnimation;
zoomTo = (newScale, duration, easing) => {
  // console.log("New scale : " + newScale);
  if (zoomAnimation) {
    zoomAnimation.pause();
  }
  zoomAnimation = anime({
    targets: this,
    currentScale: newScale,
    duration: duration,
    easing: easing
  });
}

var moveAnimation;
// Important : the next planet to follow must already be set before calling this
// function. Otherwise we can't predict what the offset will be in relation to,
// and can't preserve the current camera position.
moveTo = (cameraOffsetX, cameraOffsetY, duration, easing) => {
  cameraOffset.x = camera.position.x - planetToFollow.position.x;
  cameraOffset.y = camera.position.y - planetToFollow.position.y;
  if (moveAnimation) {
    moveAnimation.pause();
  }
  moveAnimation = anime({
    targets: cameraOffset,
    x: cameraOffsetX,
    y: cameraOffsetY,
    easing: easing,
    duration: duration,
    complete: function() {
      moveAnimation = null;
    }
  });
}


getMatchingZoom = (realDistance, screenDistance) => {
  let newScale = screenDistance / pixelDensity() / realDistance;
  return newScale;
}


watchPlanetGoBy = (planet) => {

  // Follow the star, but preserving our camera
  planetToFollow = planet.celestialParent;
  let isSeconds = (planet.getAngle === getSecondsAngle)

  // Calculate the position that the object will be at in a few moments.
  let degreesAdvance = isSeconds ? 75 : 7;
  let cameraOffsetX = Math.sin(planet.getAngle() - radians(degreesAdvance)) * planet.orbitRadius;
  let cameraOffsetY = Math.cos(planet.getAngle() - radians(degreesAdvance)) * planet.orbitRadius;

  moveTo(cameraOffsetX, cameraOffsetY, 1000, "easeInOutQuad");

  let newScale = 1 + Math.random() * 5
  if (!isSeconds) {
    newScale = getMatchingZoom(planet.satellite.orbitRadius, width);
    newScale *= 1 + Math.random() * 1.2;
  }
  zoomTo(newScale, 2000, "easeInOutQuad");
}




followPlanet = (planet) => {
  planetToFollow = planet;
  let cameraOffsetX = (Math.random() - 0.5) * width / 8;
  let cameraOffsetY = (Math.random() - 0.5) * height / 8;
  moveTo(cameraOffsetX, cameraOffsetY, 2000, "easeInOutQuad");

  let newScale = 1 + Math.random() * 5;
  zoomTo(newScale, 2000, "easeInOutQuad");
}



var zoomStep = 1.03;
mouseWheel = (event) => {
  // Trackpad scroll can cause animation conflict -> Re-init
  if (!currentScale) {
    currentScale = 2;
  }
  // Calculate the newScale from the delta of scroll
  let newScale;
  if (event.delta > 0 && currentScale > 0.1) {
    newScale = currentScale / (zoomStep + event.delta / 100);
  } else if (event.delta < 0 && currentScale < 100) {
    newScale = currentScale * (zoomStep - event.delta / 100);
  }
  // Zoom to that scale.
  zoomTo(newScale, 300, "easeOutQuad");
  return false;
}

justChangedCamera = () => {
  lastCameraPick = new Date(Math.floor((new Date()).getTime() / cameraFrequency) * cameraFrequency).getTime()
  if (hhmmss) {
    lastCameraPick = Math.floor(hhmmss.getTime() / cameraFrequency) * cameraFrequency;
  }
}

justEndedTheWorld = () => {
  lastEndOfTheWorld = new Date(Math.floor((new Date()).getTime() / endOfTheWorldFrequency) * endOfTheWorldFrequency).getTime()
  if (hhmmss) {
    lastEndOfTheWorld = Math.floor(hhmmss.getTime() / endOfTheWorldFrequency) * endOfTheWorldFrequency;
  }
}

pickACamera = () => {
  // Pick a random planet.
  let planet = star.satellite;
  if (Math.random() < 0.5) {
    console.log("moon");
    planet = star.satellite.satellite;
  } else {
    console.log("planet");
  }
  // Pick a random camera function.
  if (Math.random() < 0.5) {
    followPlanet(planet);
    console.log("follow");
  } else {
    console.log("watch");
    watchPlanetGoBy(planet);
  }
  justChangedCamera();
}


goToCenter = (alignDuration) => {
  planetToFollow = star;
  moveTo(0, 0, alignDuration, "easeInOutSine");

  let newScale = getMatchingZoom(
    (star.satellite.orbitRadius + star.satellite.satellite.orbitRadius) * (1.1 + 0.4 * Math.random()),
    Math.max(width, height)
  );
  zoomTo(newScale, alignDuration, "easeInOutSine");
}

var endingTheWorld = false;
endOfTheWorld = () => {
  // Can't double end a world
  if (endingTheWorld) {
    return;
  }
  endingTheWorld = true;

  let alignDuration = 6000;
  let crashDuration = 16500;
  // First align everything
  goToCenter(alignDuration);
  // Everything crashes
  var ani1 = anime({
    targets: star.satellite,
    orbitRadius: star.radius * star.sunRatio * 0.5,
    easing: "easeInExpo",
    delay: alignDuration * 0.6,
    duration: crashDuration
  });
  var ani2 = anime({
    targets: star.satellite.satellite,
    orbitRadius: 0,
    easing: "easeInExpo",
    delay: alignDuration * 0.6,
    duration: crashDuration
  });
  // The star gets bigger
  var ani3 = anime({
    targets: star,
    radius: Math.max(width, height) / star.sunRatio,
    easing: "easeInExpo",
    delay: alignDuration + 0.2 * crashDuration,
    duration: 22000,
    complete: function() {
      console.log("done bigger");
      // Zoom to the core of the star
      currentScale = 10;
      // Switch solar systems
      generateSolarSystem();
      // Zoom out from the center
      let newScale = getMatchingZoom(
        (star.satellite.orbitRadius + star.satellite.satellite.orbitRadius),
        Math.max(width, height)
      );
      let zoomOutDuration = 10000;
      zoomTo(newScale, zoomOutDuration, "easeOutSine");
      // Go back to normal camera mode after zooming out.
      window.setTimeout(function() {
        justChangedCamera();
        justEndedTheWorld();
        endingTheWorld = false;
      }, zoomOutDuration * 2);
    }
  });
}

mouseClicked = () => {
  // Chain cameras
  // if (planetToFollow.satellite) {
  //   followPlanet(planetToFollow.satellite);
  // } else {
  //   watchPlanetGoBy(star.satellite);
  // }


  if (hhmmss) {
  } else {
    // endOfTheWorld();
    // pickACamera();
    // generateSolarSystem();
  }
}



mouseDragged = (event) => {
  // Don't drag during a move animation
  if (hhmmss || endingTheWorld || moveAnimation) {
    return;
  }

  cameraOffset.x = Number(cameraOffset.x) + (pmouseX - mouseX) / currentScale;
  cameraOffset.y = Number(cameraOffset.y) + (pmouseY - mouseY) / currentScale;
}
