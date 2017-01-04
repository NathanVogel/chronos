

// Our own camera offset object
// Mainly to watch the planet go by from a point of view.
// also used to not have to center the planet each time
var cameraOffset = {
  x: 0,
  y: 0
};

var zoomAnimation;
zoomTo = (newScale, duration, easing) => {
  console.log("New scale : " + newScale);
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
  var moveAnimation = anime({
    targets: cameraOffset,
    x: cameraOffsetX,
    y: cameraOffsetY,
    easing: easing,
    duration: duration
  });
}


getMatchingZoom = (realDistance, screenDistance) => {
  let newScale = screenDistance * pixelDensity() / realDistance;
  newScale *= 1 + Math.random() * 1.2;
  return newScale;
}


watchPlanetGoBy = (planet) => {

  // Follow the star, but preserving our camera
  planetToFollow = planet.celestialParent;

  // Calculate the position that the object will be at in a few minutes.
  var cameraOffsetX = Math.sin(planet.getAngle() - radians(6)) * planet.orbitRadius;
  var cameraOffsetY = Math.cos(planet.getAngle() - radians(6)) * planet.orbitRadius;
  // Offset our position to move to the parent object (usually the star).
  cameraOffsetX += planet.celestialParent.position.x;
  cameraOffsetY += planet.celestialParent.position.y;

  moveTo(cameraOffsetX, cameraOffsetY, 2000, "easeInOutQuad");

  let newScale = getMatchingZoom(planet.satellite.orbitRadius, width / 2);
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
  //print(event.delta);
  //print(currentScale);
  let newScale;
  if (event.delta > 0 && currentScale > 0.1) {
    newScale = currentScale / (zoomStep + event.delta / 100);
  } else if (event.delta < 0 && currentScale < 100) {
    newScale = currentScale * (zoomStep - event.delta / 100);
  }
  zoomTo(newScale, 300, "easeOutQuad");
  return false;
}


mouseClicked = () => {
  if (planetToFollow.satellite) {
    followPlanet(planetToFollow.satellite);
  } else {
    watchPlanetGoBy(star.satellite.satellite);
  }
}
