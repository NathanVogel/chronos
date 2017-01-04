


var cameraOffset = {
  thex: 0,
  they: 0
};
//cameraOffset.they = 0;

watchMinuteGoBy = () => {
  planetToFollow = star;

  // Calculate the position that the object will be at in a few minutes.
  let cameraOffsetX = Math.sin(star.satellite.getAngle() - radians(6)) * star.satellite.orbitRadius;
  let cameraOffsetY = Math.cos(star.satellite.getAngle() - radians(6)) * star.satellite.orbitRadius;
  // Offset our position to move to the parent object.
  cameraOffsetX += star.position.x;
  cameraOffsetY += star.position.y;


  // var myAnimation = anime({
  //   targets: cameraOffset,
  //   thex: cameraOffsetX,
  //   they: cameraOffsetY,
  //   duration: 5000,
  //   update: function() {
  //     //console.log(cameraOffset);
  //   }
  // });
  cameraOffset.thex = cameraOffsetX;
  cameraOffset.they = cameraOffsetY;

  setZoomToMatch(star.satellite.satellite.orbitRadius, width / 2)
}

setZoomToMatch = (realDistance, screenDistance) => {
  let newScale = screenDistance / realDistance;
  currentScale *= 0.7 + Math.random() * 0.6
}



var zoomStep = 1.03;
mouseWheel = (event) => {
  //print(event.delta);
  //print(currentScale);
  if (event.delta > 0 && currentScale > 0.1) {
    currentScale /= (zoomStep + event.delta / 100);
  } else if (event.delta < 0 && currentScale < 100) {
    currentScale *= (zoomStep - event.delta / 100);
  }
  return false;
}


mouseClicked = () => {
  if (planetToFollow.satellite) {
    cameraOffset.thex = 0;
    cameraOffset.they = 0;
    planetToFollow = planetToFollow.satellite;
  } else {
    planetToFollow = star;
    watchMinuteGoBy();
  }
  console.log(camera);
}
