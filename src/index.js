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

  update() {
    push();
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
  fill(10, 10, 240);
  ellipse(0, 0, this.radius * 2);
// print("Earth angle : " + this.getAngle())
}

drawMoon = function() {
  fill(150, 150, 150);
  ellipse(0, 0, this.radius * 2);
  if (this.getAngle() < 0.1) {
    print("yo")
    stroke(0);
  // line(this.celestialParent.position.x,
  // this.celestialParent.position.y,
  // this.position.x, this.position.x);
  }
}


draw3DSun = function() {
  ambientMaterial(220, 200, 0);
  sphere(this.radius, 600);
}

draw3DEarth = function() {
  ambientMaterial(10, 50, 230);
  sphere(this.radius, 100);
}

draw3DMoon = function() {
  ambientMaterial(180, 180, 180);
  sphere(this.radius, 100);
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

var followPlanet = true;
var systemDensity = 2; // Per 100x100 pixels surface at origin depth
var systemSkyDistance = 300;

// Create system
var star = new Planet(drawSun, getNoAngle, 100, 0, null);
star.satellite = new Planet(drawEarth, getSecondsAngle, 30, 300, star);
star.satellite.satellite = new Planet(drawMoon, getMillisAngle, 10, 70,
  star.satellite
);




// ====== SETUP ======

var stars = [];
var currentScale = 2;
var maxSystemSpan = getSystemSpan(star);
var systemSizeX = maxSystemSpan * 5 * systemSkyDistance / 300;
var systemSizeY = systemSizeX;
var systemStarCount = (systemSizeX * systemSizeY / (100 * 100)) * systemDensity;
print("Star count : " + systemStarCount);
if (systemStarCount > 1000) {
  systemStarCount = 1000;
}

setup = () => {
  createCanvas(window.innerWidth, window.innerHeight, WEBGL);
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
  // Some 3D stuff
  // rotateX(frameCount * 0.001);
  // rotateY(frameCount * 0.0007);
  // var dirY = (mouseY / height - 0.5) * 2;
  // var dirX = (mouseX / width - 0.5) * 2;
  // pointLight(255, 230, 230, 0.1, 0, 0, 0);
  //mouseX - width / 2, -mouseY + height / 2, 500);

  background(20);

  // Move our camera
  if (followPlanet) {
    scale(currentScale);
    translate(-star.satellite.position.x, -star.satellite.position.y);
  }

  // Draw the planets
  let currentPlanet = star;
  while (currentPlanet) {
    currentPlanet.update();
    currentPlanet = currentPlanet.satellite;
  }

  // Draw the sky
  for (let i = 0; i < stars.length; i++) {
    stars[i].update();
  }


}
