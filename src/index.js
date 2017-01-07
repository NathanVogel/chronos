var hhmmss = null;
// hhmmss = new HHMMSS({
//   type: "horizontal",
//   horizontalAlign: "hcenter",
//   verticalAlign: "vcenter",
//   size: "small",
//   invert: true,
//   sleepTime: 1000
// });
if (hhmmss) {
  hhmmss.getTime = function() {
    return (((hhmmss.getH() * 60 + hhmmss.getM()) * 60) + hhmmss.getS()) * 1000;
  }
}




var img_jupiter,
  img_sun,
  img_mars,
  img_moon,
  img_shadow;

// Change camera every 5 minutes.
var cameraFrequency = 1000 * 60 * 5;
var lastCameraPick;
justChangedCamera();
// var lastCameraPick = new Date(Math.floor((new Date()).getTime() / cameraFrequency) * cameraFrequency).getTime();
// if (hhmmss) {
//   lastCameraPick = Math.floor(hhmmss.getTime() / cameraFrequency) * cameraFrequency;
// }

// Change world every hour.
var endOfTheWorldFrequency = 1000 * 60 * 60;
var lastEndOfTheWorld;
justEndedTheWorld();


function preload() {
  img_shadow = loadImage("img/shadow.png");
// img_jupiter = loadImage("img/jupiter-transparent.png");
// img_moon = loadImage("img/moon.png");
// img_mars = loadImage("img/marsmap1k.jpg");
// img_sun = loadImage("img/sun.png");
}


var star,
  planetToFollow;
var backgroundColor;
var systemDensity = 1; // Per 100x100 pixels surface at origin depth
var systemSkyDistance = 100;
var stars = [];
var currentScale = 3;
var maxSystemSpan,
  systemSizeX,
  ystemSizeY,
  systemStarCount = 0;
let planetResolution = 1000;
let density = 1 / planetResolution;
var planetMask;




/*********
 * SETUP *
 *********/
function setup() {
  createCanvas(window.innerWidth, window.innerHeight);
  backgroundColor = color(14);

  // Note : better to stay at small size, not sure why anymore (only in 3D ?)


  // ====== SOLAR SYSTEM =======

  planetMask = createGraphics(planetResolution, planetResolution);
  planetMask.noStroke();
  planetMask.fill(color('white'));
  planetMask.ellipseMode(CENTER);
  planetMask.ellipse(planetResolution / 2, planetResolution / 2, planetResolution, planetResolution);
  planetMask.loadPixels();

  // Jpeg version :
  // var star = new Planet(null, drawImageSun, getNoAngle, 100, 0, null);
  // star.satellite = new Planet(null, drawImageJupiter, getMinutesAngle, 40, 240, star);
  // star.satellite.satellite = new Planet(null, drawImageMoon, getSecondsAngle, 20, 100, star.satellite);
  // star.satellite.satellite.satellite = new Planet(null, drawSatellite, getMillisAngle, 2, 25,
  //   star.satellite.satellite
  // );


  generateSolarSystem();

  // ====== SKY ======

  systemDensity = 1; // Per 100x100 pixels surface at origin depth
  systemSkyDistance = 100;

  maxSystemSpan = getSystemSpan(star);
  systemSizeX = maxSystemSpan * 5;
  systemSizeY = systemSizeX;
  systemStarCount = (systemSizeX * systemSizeY / (100 * 100)) * systemDensity;
  console.log("Star count : " + systemStarCount);
  if (systemStarCount > 700) {
    systemStarCount = 700;
  }

  for (let i = 0; i < systemStarCount; i++) {
    stars.push(new Star(
      Math.random() * systemSizeX - systemSizeX / 2,
      Math.random() * systemSizeY - systemSizeY / 2,
      Math.random() * -systemSkyDistance * systemDensity - systemSkyDistance,
      Math.random() * 3)
    );
  }

  // ====== CAMERA ======

  currentScale = 1;
  pickACamera();


  // ====== SETUP ======

  imageMode(CENTER);
  rectMode(CENTER);
  ellipseMode(CENTER);
  noStroke();

}



// ======= SOLAR SYSTEM ======

generateSolarSystem = () => {
  // The radius contains the halo
  let starRadius = 300 + Math.random() * 200;
  let planetRadius = 30 + Math.random() * 50;
  let planetDistance = starRadius + planetRadius + 10 + Math.random() * 240;
  let moonRadius = 6 + Math.random() * 20;
  let moonDistance = 2 * planetRadius + moonRadius + Math.random() * 60;
  let satelliteDistance = moonRadius + 5 + Math.random() * 20
  star = new Planet(generateSun, drawSun, getNoAngle, starRadius, 0, null);
  star.satellite = new Planet(generateFractalGradientPlanet, drawPlanet, getMinutesAngle, planetRadius, planetDistance, star);
  star.satellite.satellite = new Planet(generateGradientPlanet, drawPlanet, getSecondsAngle, moonRadius, moonDistance, star.satellite);
  star.satellite.satellite.satellite = new Planet(null, drawSatellite, getMillisAngle, 2, satelliteDistance,
    star.satellite.satellite
  );
  planetToFollow = star;
}





// ====== POINT ======
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


// ====== PLANET ======
class Planet {

  constructor(generatePlanet, drawPlanet, getAngle, radius, orbitRadius, celestialParent) {
    this.generatePlanet = generatePlanet;
    this.drawPlanet = drawPlanet;
    this.getAngle = getAngle; // The function that depends on the time.
    this.orbitRadius = orbitRadius;
    this.celestialParent = celestialParent;
    this.radius = radius;
    this.sunRatio = 1;

    // Set a default position for the star. Which is always the center
    this.position = new Point(0, 0, 0);

    // Set the initial rotation
    this.imageRotation = Math.random() * 180;
    this.imageRotationSpeed = 0.0002 + Math.random() * 0.0008;

    // Generate colors
    this.colors = [getRandomColor(), getRandomColor()];
    while (Math.random() < 0.75) {
      // Either generate a new color, or picks one that already exists
      this.colors.push(Math.random() < 0.5 ?
        getRandomColor()
        : this.colors[Math.floor(Math.random() * this.colors.length)]);
    }

    // Atmosphere settings :
    this.atmosphereSize = Math.random() * 40;
    if (this.atmosphereSize < 3) {
      this.atmosphereSize = 0;
    }
    this.atmosphereOpacity = 10 + Math.random() * 70;

    // Noise settings
    this.horizontalNoiseScale = 0.5 + Math.random() * 10;
    this.horizontalNoiseStrength = Math.random() * 120;

    // Create the base planet graphic
    if (this.generatePlanet) {
      this.generatePlanet();
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





// ====== System Parts draw ======


generateFractalGradientPlanet = function() {
  this.pg = createGraphics(planetResolution, planetResolution);
  generate(this.pg.drawingContext);
  // Apply our planet mask.
  this.pg.loadPixels();
  for (let i = 3; i < this.pg.pixels.length; i += 4) {
    this.pg.pixels[i] = planetMask.pixels[i - 1];
  }
  this.pg.updatePixels();
}


generateGradientPlanet = function() {
  this.pg = createGraphics(planetResolution, planetResolution);
  this.pg.translate(planetResolution / 2, planetResolution / 2);
  // Set the stroke mode, the strokeCap is especially important
  // ROUNDED is much slower to render.
  this.pg.strokeWeight(1);
  this.pg.strokeCap(SQUARE);

  // Draw the planet line by line on the PGraphics
  for (let i = -1 + density; i < 1; i += density) {
    // Line Color
    let percent = (i + 1) / 2;
    let c = floor(percent * (this.colors.length - 1));
    let lerped = lerpColor(this.colors[c], this.colors[c + 1], (percent * (this.colors.length - 1)) % 1);
    let n = noise(i * this.horizontalNoiseScale) * this.horizontalNoiseStrength;
    lerped = color(lerped._getRed() - n, lerped._getGreen() - n, lerped._getBlue() - n);


    this.pg.stroke(lerped);

    let angle = acos(i);
    let r = planetResolution / 2;
    // Draw each line to fill our circle
    this.pg.line(
      cos(this.imageRotation + angle) * r,
      sin(this.imageRotation + angle) * r,
      cos(this.imageRotation - angle) * r,
      sin(this.imageRotation - angle) * r
    );

  // Something weird is wrong here, the circle isn't perfect.
  // It's slightly an ellipse, I don't know why.
  }
}



generateSun = function() {
  this.pg = createGraphics(planetResolution, planetResolution);
  this.pg.translate(planetResolution / 2, planetResolution / 2);
  this.pg.ellipse(CENTER);


  let c = getRandomColor();
  let white = color(255, 248, 245);
  let gScale = 20;

  let w = 1;
  let m = planetResolution / 2 * (0.2 + 0.5 * Math.random());
  let o = 55 + 200 * Math.random();
  let radius = planetResolution / 2 - m;
  this.sunRatio = radius / planetResolution / 2;

  this.pg.fill(255, 250, 245);
  this.pg.ellipse(0, 0, radius * 2);

  this.pg.strokeWeight(w);
  this.pg.noFill();

  let insideLuminanceSize = radius * 0.9;
  let r = 180 + 75 * Math.random();
  let g = 180 + 75 * Math.random();
  let b = 180 + 75 * Math.random();

  for (let i = 0; i < m; i += w) {
    this.pg.stroke(r, g, b, pow((o - i * o / m) / (o * 2), 4) * o * 16);
    this.pg.ellipse(0, 0, radius * 2 + i - 1);
  }

  for (let i = w; i < insideLuminanceSize; i += w) {
    this.pg.stroke(r, g, b, pow((o - i * o / insideLuminanceSize) / (o * 2), 4) * o * 16);
    this.pg.ellipse(0, 0, radius * 2 - i - 1);
  }
}



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

  // Draw the planet
  if (this.pg) {
    image(this.pg, 0, 0, this.radius * 2, this.radius * 2);
  } else {
    let factor = 100 / this.radius;
    for (let r = 0; r < this.radius; r++) {
      let o = (this.radius - r);
      fill(r * factor + 140, r * factor + 120, 0);
      ellipse(0, 0, o * 2, o * 2);
    }
  }
}



drawPlanet = function() {

  // Draw a shadow behind the planet
  drawProjectedshadow(this.radius, angleToStar(this));

  // Rotation
  this.imageRotation += this.imageRotationSpeed;

  // Draw the planet
  if (this.pg) {
    push();
    rotate(this.imageRotation);
    image(this.pg, 0, 0, this.radius * 2, this.radius * 2);
    pop();
  } else {
    fill(150, 150, 150);
    ellipse(0, 0, this.radius * 2);
  }

  // Draw an atmosphere
  drawAtmosphere(this.radius, this.atmosphereSize, this.atmosphereOpacity);
  // Draw a shadow over the planet
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

  this.imageRotation += this.imageRotationSpeed * 250;
  push();
  rotate(this.imageRotation);
  rect(0, 0, this.radius, this.radius);
  pop();
}


drawOvershadow = function(radius, angle) {
  push();
  rotate(angle);
  // TODO : Check size
  image(img_shadow, 0, 0, radius * 2, radius * 2);
  pop();
}


drawProjectedshadow = function(radius, angle) {
  let ratio = star.satellite.orbitRadius / star.radius;
  let alpha = Math.min(0.55, ratio - star.sunRatio);
  if (alpha < 0) {
    alpha = 0;
  }

  push();
  rotate(angle);
  fill('rgba(0, 0, 0, ' + alpha + ')');
  noStroke();
  rectMode(CORNER);
  rect(-systemSizeX, -radius, systemSizeX, radius * 2);
  pop();
}

drawAtmosphere = function(radius, size, opacity) {
  let w = 0.2;
  let m = size;
  let o = opacity;
  strokeWeight(w);
  noFill();
  for (let i = 0; i < m && i >= 0; i += w) {
    stroke(255, 255, 255, pow((o - i * o / m) / (o * 2), 4) * o * 16);
    ellipse(0, 0, radius * 2 - (w > 0 ? +i : -i));
    // Go back the other way if we reached the top
    if (i + w >= m) {
      w = -w;
    }
  }
}




// ====== DRAW ======
// Draw every frame
draw = () => {

  background(backgroundColor);
  // console.log(hhmmss.getMillis());
  // console.log("S : " + hhmmss.getS());
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
    camera.position.x = planetToFollow.position.x + Number(cameraOffset.x);
    camera.position.y = planetToFollow.position.y + Number(cameraOffset.y);
  // For some reason the camera offset is converted to a string by anime.js
  }

  // Draw the sky
  for (let i = 0; i < stars.length; i++) {
    stars[i].update();
  }

  // We can now draw the planets

  // Star to satllite (above)
  // currentPlanet = star;
  // while (currentPlanet) {
  //   currentPlanet.updateDrawing();
  //   currentPlanet = currentPlanet.satellite;
  // }

  // Satellite to star (above)
  currentPlanet = star;
  // find the last satellite
  while (currentPlanet.satellite) {
    currentPlanet = currentPlanet.satellite;
  }
  // draw everything from here.
  while (currentPlanet) {
    currentPlanet.updateDrawing();
    currentPlanet = currentPlanet.celestialParent;
  }

  // ====== EVENTS =======

  // Don't do events during long animations
  // And not while editing the time.
  if (hhmmss) {
    if (!endingTheWorld && !mouseIsPressed) {
      // Check if we went back in time
      if (hhmmss.getTime() < lastEndOfTheWorld) {
        justEndedTheWorld();
      }
      if (hhmmss.getTime() < lastCameraPick) {
        justChangedCamera();
      }
      // Check for end of the world
      if (hhmmss.getTime() - lastEndOfTheWorld > endOfTheWorldFrequency) {
        endOfTheWorld();
      }
      // Check for camera after, as at every round hour, world gets prioritized
      else if (hhmmss.getTime() - lastCameraPick > cameraFrequency) {
        pickACamera();
      }
    }
    hhmmss.updateTime();
  }
  // Regular event handling without hhmmss
  else if (!endingTheWorld) {
    if (new Date().getTime() - lastEndOfTheWorld > endOfTheWorldFrequency) {
      endOfTheWorld();
    } else if (new Date().getTime() - lastCameraPick > cameraFrequency) {
      pickACamera();
    }
  }
}
