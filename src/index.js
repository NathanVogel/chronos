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


var img_jupiter, img_sun;
function preload() {
  //img_jupiter = loadImage("img/jupiter-transparent.png");
  img_jupiter = loadImage("img/marsmap1k.jpg");
  img_sun = loadImage("img/2k_sun.jpg");
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
  ellipse(0, 0, this.radius * 2, this.radius * 2, 70);
}

drawEarth = function() {

  // Shadow
  push();
  rotateZ(star.satellite.getAngle() + HALF_PI);
  fill('rgba(0, 0, 0, 0.99)');
  noStroke();
  rect(-systemSizeX, -this.radius, systemSizeX, this.radius * 2);
  pop();

  // Ellipse
  fill(10, 10, 240);
  ellipse(0, 0, this.radius * 2);
}

drawMoon = function() {
  // Shadow
  // push();
  // rotateZ(star.satellite.getAngle() + HALF_PI);
  // fill('rgba(0, 0, 0, 0.99)');
  // noStroke();
  // rect(-systemSizeX, -this.radius, systemSizeX, this.radius * 2);
  // pop();

  // if (this.getAngle() < 3.25) {
  //   fill(245);
  //   rect(-1, 0, 2, this.orbitRadius - this.celestialParent.radius + 2);
  // }

  fill(150, 150, 150);
  ellipse(0, 0, this.radius * 2);

}


draw3DSun = function() {
  ambientMaterial(220, 200, 0);
  sphere(this.radius, 600);
}

draw3DSun1 = function() {
    texture(img_sun);
    push();
    rotateY(PI+frameCount*0.0002);
    sphere(this.radius, 300);
    pop();
}

draw3DEarth = function() {
  ambientMaterial(10, 50, 230);
  sphere(this.radius, 100);
}

draw3DMoon = function() {
  ambientMaterial(180, 180, 180);
  sphere(this.radius, 100);
}

draw3DMars = function() {
  texture(img_jupiter);//-img_jupiter.width/2, -img_jupiter.height/2);
  push();
  rotateY(PI+frameCount*0.002);
  sphere(this.radius);
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
    strokeWeight(this.intensity);
    stroke(255);
    push();
    translate(this.x, this.y, this.z);
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


var star = new Planet(draw3DSun1, getNoAngle, 100, 0, null);
star.satellite = new Planet(draw3DMars, getMinutesAngle, 15, 280, star);
star.satellite.satellite = new Planet(draw3DMoon, getSecondsAngle, 5, 50,
  star.satellite
);
star.satellite.satellite.satellite = new Planet(draw3DMoon, getMillisAngle, 1, 9,
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
// if (systemStarCount > 500) {
//   systemStarCount = 500;
// }

setup = () => {
  createCanvas(window.innerWidth, window.innerHeight, WEBGL);

  imageMode(CENTER);

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
  background(5);


  // Some 3D stuff
  // rotateX(frameCount * 0.001);
  // rotateY(frameCount * 0.0007);
  //mouseX - width / 2, -mouseY + height / 2, 500);

 ambientLight(100, 80, 90, 0.02);

  pointLight(255, 230, 230, 1, 110, 110, 1030/currentScale);
  //   pointLight(255, 230, 230, 1, 110, 110, -1030/currentScale);
  //     pointLight(255, 230, 230, 1, -110, -110, 1030/currentScale);
  //       pointLight(255, 230, 230, 1, -110, -110, -1030/currentScale);

  //pointLight(255, 230, 230, 0.3, -110, 0, -1);
  //pointLight(255, 230, 230, 0.3, 110, 0, -1);
  //pointLight(255, 230, 230, 0.3, 0, -110, -1);
  //pointLight(255, 230, 230, 0.3, 0, 110, -1);

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
    scale(currentScale);
    translate(-planetToFollow.position.x, -planetToFollow.position.y);
  }

  // We can now draw the planets
  currentPlanet = star;
  while (currentPlanet) {
    currentPlanet.updateDrawing();
    currentPlanet = currentPlanet.satellite;
  }

  // Draw the sky
  for (let i = 0; i < stars.length; i++) {
    stars[i].update();
  }
}

var zoomStep = 1.3;
mouseWheel = (event) => {
  if (event.delta > 0) {
    currentScale /= zoomStep;
  }
  else {
    currentScale *= zoomStep;
  }
}


mouseClicked = () => {
  if (planetToFollow.satellite) {
    planetToFollow = planetToFollow.satellite;
  }
  else {
    planetToFollow = star;
  }
}
