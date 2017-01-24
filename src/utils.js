

// ====== CALCULATIONS ======

// Calculate angles

getNoAngle = () => {
  return 0;
}

getProgressionOfCurrentSecond = () => {
  return ((hhmmss) ? hhmmss.getMillis() : new Date().getMilliseconds()) / 1000;
}

getMillisAngle = () => {
  let a = ((1 - (getProgressionOfCurrentSecond())) * TWO_PI) + PI;
  return a;
}


getProgressionOfCurrentMinute = () => {
  return (((hhmmss) ? hhmmss.getS() : new Date().getSeconds()) + getProgressionOfCurrentSecond()) / 60 ;
}

getSecondsAngle = () => {
  let a = ((1 - getProgressionOfCurrentMinute())) * TWO_PI;
  a += PI;
  return a;
}


getProgressionOfCurrentHour = () => {
  // console.log("S : " + hhmmss.getS() + " vs. " + hhmmss.getMillis());
  return (((hhmmss) ? hhmmss.getM() : new Date().getMinutes()) + getProgressionOfCurrentMinute()) / 60;
}

getMinutesAngle = () => {
  let a = ((1 - getProgressionOfCurrentHour())) * TWO_PI;
  a -=  PI;
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
