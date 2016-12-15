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



class Point {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z ? z : 0;
  }
}


class Planet {

  constructor(drawPlanet, getAngle, radius, orbitRadius, celestialParent) {
    this.drawPlanet = drawPlanet;
    this.getAngle = getAngle;
    this.orbitRadius = orbitRadius;
    this.celestialParent = celestialParent;
    this.radius = radius;

    // Set a default position for the star. Which is always the center of
    this.position = new Point(0, 0, 0);
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



// ====== System Parts draw ======

drawSun = function() {
  fill(240, 240, 0);
  //ellipse(0, 0, this.radius * 2, this.radius * 2, 70);
  imageMode(CENTER);
  image(img_sun, 0, 0, this.radius * 2, this.radius * 2);
}

drawEarth = function() {

  drawProjectedshadow(this.radius, angleToStar(this));

  image(img_jupiter, 0, 0, this.radius * 2, this.radius * 2);
  drawOvershadow(this.radius, angleToStar(this)); //star.satellite.getAngle());
// fill(10, 100, 240);
//ellipse(0, 0, this.radius * 2);
}


drawMoon = function() {

  drawProjectedshadow(this.radius, angleToStar(this));

  image(img_moon, 0, 0, this.radius * 2, this.radius * 2);
  drawOvershadow(this.radius, angleToStar(this));
//fill(150, 150, 150);
//ellipse(0, 0, this.radius * 2);
}


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
  fill('rgba(0, 0, 0, 0.3)');
  noStroke();
  rectMode(CORNER);
  rect(-systemSizeX, -radius, systemSizeX, radius * 2);
  pop();
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


// ====== PREFERENCES ======

// Create system
// var star = new Planet(drawSun, getNoAngle, 100, 0, null);
// star.satellite = new Planet(drawEarth, getSecondsAngle, 30, 300, star);
// star.satellite.satellite = new Planet(drawMoon, getMillisAngle, 7, 70,
//   star.satellite
// );

// Note : better to stay at small size, not sure why anymore (only in 3D ?)
var star = new Planet(drawSun, getNoAngle, 200, 0, null);
star.satellite = new Planet(drawEarth, getMinutesAngle, 40, 440, star);
star.satellite.satellite = new Planet(drawMoon, getSecondsAngle, 20, 100, star.satellite);
star.satellite.satellite.satellite = new Planet(drawSatellite, getMillisAngle, 2, 25,
  star.satellite.satellite
);

var planetToFollow = star.satellite;
var systemDensity = 1; // Per 100x100 pixels surface at origin depth
var systemSkyDistance = 100;





// ====== SETUP ======

var stars = [];
var currentScale = 3;
var maxSystemSpan = getSystemSpan(star);
var systemSizeX = maxSystemSpan * 5;
var systemSizeY = systemSizeX;
var systemStarCount = (systemSizeX * systemSizeY / (100 * 100)) * systemDensity;
print("Star count : " + systemStarCount);
if (systemStarCount > 500) {
  systemStarCount = 500;
}

setup = () => {
  createCanvas(window.innerWidth, window.innerHeight);

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


// ====== DRAW ======
// Draw every frame
draw = () => {
  background(10);



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
    camera.position.x = planetToFollow.position.x;
    camera.position.y = planetToFollow.position.y;
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
    planetToFollow = planetToFollow.satellite;
  } else {
    planetToFollow = star;
  }
}
