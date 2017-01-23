

// ====== CALCULATIONS ======

// Calculate angles

getNoAngle = () => {
  return 0;
}

getMillisAngle = () => {
  let millis = (hhmmss) ? hhmmss.getMillis() : new Date().getMilliseconds();
  let a = ((1 - (millis / 1000)) * TWO_PI) + PI;
  return a;
}

getSecondsAngle = () => {
  let seconds = (hhmmss) ? hhmmss.getS() : new Date().getSeconds();
  let a = ((1 - (seconds / 60)) * TWO_PI);
  a += ((getMillisAngle() ) / 60);
  a += PI;
  return a;
}

getMinutesAngle = () => {
  let minutes = (hhmmss) ? hhmmss.getM() : new Date().getMinutes();
  let a = ((1 - (minutes / 60)) * TWO_PI);
  a += ((getSecondsAngle() ) / 60);
  a += PI;
  return a;
}

// Returns the angle that the shadow must be rotated to.
angleToStar = function(planet) {
  var a = atan2(star.position.x - planet.position.x, star.position.y - planet.position.y);
  return -a + HALF_PI;
}


// Calculate the maximum size of the system

getSystemSpan = (firstStar) => {
  var maxSystemSpan = 0;
  let currentPlanet = firstStar;
  while (currentPlanet) {
    maxSystemSpan += currentPlanet.orbitRadius;
    currentPlanet = currentPlanet.satellite;
  }
  return maxSystemSpan;
}


getRandomColor = () => {
  return color(Math.random() * 255, Math.random() * 255, Math.random() * 255);
}


// ====== POINT ======
class Point {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z ? z : 0;
  }
}
