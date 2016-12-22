// var hhmmss = new HHMMSS({
//   type: "horizontal",
//   horizontalAlign: "hcenter",
//   verticalAlign: "vcenter",
//   size: "small",
//   invert: false,
//   sleepTime: 200
// });


print = (str) => {
  console.log(str);
}


var img_jupiter,
  img_sun,
  img_mars,
  img_moon,
  img_shadow;

function preload() {
  img_jupiter = loadImage("img/jupiter-transparent.png");
  img_moon = loadImage("img/moon.png");
  img_shadow = loadImage("img/shadow.png");
  // img_mars = loadImage("img/marsmap1k.jpg");
  img_sun = loadImage("img/sun.png");
}

var star,
  planetToFollow;
var systemDensity = 1; // Per 100x100 pixels surface at origin depth
var systemSkyDistance = 100;
var stars = [];
var currentScale = 3;
var maxSystemSpan,
  systemSizeX,
  ystemSizeY,
  systemStarCount = 0;

function setup() {
  createCanvas(window.innerWidth, window.innerHeight);



  // ====== PREFERENCES ======

  // Note : better to stay at small size, not sure why anymore (only in 3D ?)


  // Create system
  // var star = new Planet(drawSun, getNoAngle, 100, 0, null);
  // star.satellite = new Planet(drawEarth, getSecondsAngle, 30, 300, star);
  // star.satellite.satellite = new Planet(drawMoon, getMillisAngle, 7, 70,
  //   star.satellite
  // );

  /**
   * FROM JPEG
   */
  // var star = new Planet(drawImageSun, getNoAngle, 100, 0, null);
  // star.satellite = new Planet(drawImageJupiter, getMinutesAngle, 40, 240, star);
  // star.satellite.satellite = new Planet(drawImageMoon, getSecondsAngle, 20, 100, star.satellite);
  // star.satellite.satellite.satellite = new Planet(drawSatellite, getMillisAngle, 2, 25,
  //   star.satellite.satellite
  // );


  let starRadius = 60 + Math.random() * 200;
  let planetRadius = 30 + Math.random() * 50;
  let planetDistance = 2 * starRadius + planetRadius + Math.random() * 200;
  let moonRadius = 10 + Math.random() * 20;
  let moonDistance = 2 * planetRadius + moonRadius + Math.random() * 80;
  let satelliteDistance = moonRadius + 5 + Math.random() * 20
  star = new Planet(drawSun, getNoAngle, starRadius, 0, null);
  star.satellite = new Planet(drawPlanet, getMinutesAngle, planetRadius, planetDistance, star);
  star.satellite.satellite = new Planet(drawPlanet, getSecondsAngle, moonRadius, moonDistance, star.satellite);
  star.satellite.satellite.satellite = new Planet(drawSatellite, getMillisAngle, 2, satelliteDistance,
    star.satellite.satellite
  );


  planetToFollow = star.satellite;
  systemDensity = 1; // Per 100x100 pixels surface at origin depth
  systemSkyDistance = 100;

  maxSystemSpan = getSystemSpan(star);
  systemSizeX = maxSystemSpan * 5;
  systemSizeY = systemSizeX;
  systemStarCount = (systemSizeX * systemSizeY / (100 * 100)) * systemDensity;
  print("Star count : " + systemStarCount);
  if (systemStarCount > 500) {
    systemStarCount = 500;
  }




  // ====== SETUP ======

  imageMode(CENTER);
  rectMode(CENTER);
  ellipseMode(CENTER);
  noStroke();

  for (let i = 0; i < systemStarCount; i++) {
    stars.push(new Star(
      Math.random() * systemSizeX - systemSizeX / 2,
      Math.random() * systemSizeY - systemSizeY / 2,
      Math.random() * -systemSkyDistance * systemDensity - systemSkyDistance,
      Math.random() * 3)
    );
  }
}


class Point {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z ? z : 0;
  }
}

getRandomColor = () => {
  return color(Math.random() * 255, Math.random() * 255, Math.random() * 255);
}

class Planet {

  constructor(drawPlanet, getAngle, radius, orbitRadius, celestialParent) {
    this.drawPlanet = drawPlanet;
    this.getAngle = getAngle; // The function that depends on the time.
    this.orbitRadius = orbitRadius;
    this.celestialParent = celestialParent;
    this.radius = radius;

    // Set a default position for the star. Which is always the center of
    this.position = new Point(0, 0, 0);
    this.imageRotation = Math.random() * 180;
    this.imageRotationSpeed = 0.000001 + Math.random() * 0.000002;
    this.colors = [getRandomColor(), getRandomColor()];
    while (Math.random() < 0.8) {
      // Either generate a new color, or picks one that already exists
      this.colors.push(Math.random() < 0.5 ?
        getRandomColor()
        : this.colors[Math.floor(Math.random() * this.colors.length)]);
    }
  }

  updatePosition() {
    // If this object has a parent, calculate its position.
    // Note : if it doesn't have one, it'll use the default 0, 0
    if (this.celestialParent != null) {
      // Calculate the position relative to the parent object.
      this.position.x = Math.sin(this.getAngle()) * this.orbitRadius;
      this.position.y = Math.cos(this.getAngle()) * this.orbitRadius;
      this.position.z = this.celestialParent.position.z;
      // Offset our position to move to the parent object.
      this.position.x += this.celestialParent.position.x;
      this.position.y += this.celestialParent.position.y;
    }
  }

  updateDrawing() {
    push();
    // Move and draw.
    translate(this.position.x, this.position.y);
    this.drawPlanet();
    pop();
  }
}



class Star {

  constructor(x, y, z, intensity) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.intensity = intensity;
  }

  update() {
    //strokeWeight(this.intensity);
    fill(255);
    push();
    translate(this.x, this.y);
    ellipse(0, 0, this.intensity);
    pop();
  }
}



// ====== CALCULATIONS ======

// Calculate angles

getNoAngle = () => {
  return 0;
}

getMillisAngle = () => {
  let a = ((1 - (new Date().getMilliseconds() / 1000)) * TWO_PI) + PI;
  return a;
}

getSecondsAngle = () => {
  let a = ((1 - (new Date().getSeconds() / 60)) * TWO_PI);
  a += ((getMillisAngle() ) / 60);
  a += PI;
  return a;
}

getMinutesAngle = () => {
  let a = ((1 - (new Date().getMinutes() / 60)) * TWO_PI);
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





// ====== System Parts draw ======

drawImageSun = function() {
  fill(240, 240, 0);
  //ellipse(0, 0, this.radius * 2, this.radius * 2, 70);
  imageMode(CENTER);
  image(img_sun, 0, 0, this.radius * 2, this.radius * 2);
}



drawImageJupiter = function() {
  drawProjectedshadow(this.radius, angleToStar(this));
  image(img_jupiter, 0, 0, this.radius * 2, this.radius * 2);
  drawOvershadow(this.radius, angleToStar(this)); //star.satellite.getAngle());
// fill(10, 100, 240);
//ellipse(0, 0, this.radius * 2);
}


drawImageMoon = function() {

  drawProjectedshadow(this.radius, angleToStar(this));

  image(img_moon, 0, 0, this.radius * 2, this.radius * 2);
  drawOvershadow(this.radius, angleToStar(this));
//fill(150, 150, 150);
//ellipse(0, 0, this.radius * 2);
}



// LINES GRADIENT

drawSun = function() {
  let factor = 100 / this.radius;
  for (let r = 0; r < this.radius; r++) {
    let o = (this.radius - r);
    fill(r * factor + 140, r * factor + 120, 0);
    ellipse(0, 0, o * 2, o * 2);
  }
}



let density = 0.003;

let logged = false;
drawPlanet = function() {

  drawProjectedshadow(this.radius, angleToStar(this));

  strokeWeight(1);
  strokeCap(SQUARE);
  // TODO : this should be calculated once, outputed to a Graphics or img
  // maybe even calculate a mask at the end
  for (let i = -1 + density; i < 1; i += density) {
    //stroke((i+1) * 50, 50, 100);
    let percent = (i + 1) / 2;
    let c = floor(percent * (this.colors.length - 1));
    let lerped = lerpColor(this.colors[c], this.colors[c + 1], (percent * (this.colors.length - 1)) % 1);

    // for (let j = 0; j < lerped.levels.length; j++) {
    //   //lerped.levels[j] -= noise(lerped.levels[j]) * 10;
    //     lerped._array[j] -= noise(lerped.levels[0]+percent*50)/255*350;
    // }
    logged = true;
    stroke(lerped);
    let angle = acos(i);
    // Something weird is wrong here, the circle isn't perfect.
    // It's slightly an ellipse, I don't know why.
    // Adding one at the max of the the smaller axis fixes this...
    let r = this.radius; // (this.radius + (1-abs(i))) - 1;
    // Draw each line to fill our circle
    line(
      cos(this.imageRotation + angle) * r,
      sin(this.imageRotation + angle) * r,
      cos(this.imageRotation - angle) * r,
      sin(this.imageRotation - angle) * r);
    // Make our gradient turn.
    this.imageRotation += this.imageRotationSpeed;
  }

  // Draw an atmosphere
  noFill();
  let w = 0.2;
  let m = 8;
  let o = 50;
  strokeWeight(w);
  for (let i = 0; i < m && i >= 0; i += w) {
    stroke(255, 255, 255, (o - i * o / m));
    ellipse(0, 0, this.radius * 2 - (w > 0 ? +i : -i));
    // Go back the other way if we reached the top
    if (i + w >= m) {
      w = -w;
    }
  }

  drawOvershadow(this.radius, angleToStar(this));
  // Quick code to visually check if the ellipse is a perfect circle
  // stroke(255);
  // noFill();
  // strokeWeight(0.2);
  // ellipse(0, 0, this.radius * 2);

}


drawMoon = function() {
  drawProjectedshadow(this.radius, angleToStar(this));
  fill(150, 150, 150);
  ellipse(0, 0, this.radius * 2);
  drawOvershadow(this.radius, angleToStar(this));
}



// STANDARD SHADOWS etc.

drawSatellite = function() {
  fill(150, 150, 150);
  rectMode(CENTER);
  rect(0, 0, this.radius, this.radius);
}


drawOvershadow = function(radius, angle) {
  push();
  rotate(angle);
  image(img_shadow, 0, 0, radius * 2 + 0.5, radius * 2 + 0.5);
  pop();
}

drawProjectedshadow = function(radius, angle) {
  push();
  rotate(angle);
  fill('rgba(0, 0, 0, 0.33)');
  noStroke();
  rectMode(CORNER);
  rect(-systemSizeX, -radius, systemSizeX, radius * 2);
  pop();
}


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


// ====== DRAW ======
// Draw every frame
draw = () => {
  background(14);

  // Update the planets position.
  // Do this before updating the camera, as the camera can follow planets.
  // The offset between the camera and the planet can cause stutters
  // when the framerate drops.
  let currentPlanet = star;
  while (currentPlanet) {
    currentPlanet.updatePosition();
    currentPlanet = currentPlanet.satellite;
  }

  // Move our camera
  if (planetToFollow) {
    camera.zoom = currentScale;
    //console.log(camera.position.x);
    camera.position.x = planetToFollow.position.x + cameraOffset.thex;
    camera.position.y = planetToFollow.position.y + cameraOffset.they;
  // scale(currentScale);
  // translate(
  //   currentScale * -planetToFollow.position.x, // + width / 2,
  //   currentScale * -planetToFollow.position.y); // + height / 2);
  }

  // Draw the sky
  for (let i = 0; i < stars.length; i++) {
    stars[i].update();
  }

  // We can now draw the planets
  currentPlanet = star;
  while (currentPlanet) {
    currentPlanet.updateDrawing();
    currentPlanet = currentPlanet.satellite;
  }
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
