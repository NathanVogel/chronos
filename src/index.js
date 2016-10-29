// var hhmmss = new HHMMSS({
//   type: "horizontal",
//   horizontalAlign: "hcenter",
//   verticalAlign: "vcenter",
//   size: "small",
//   invert: false,
//   sleepTime: 200
// });


class Point {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
}


class Planet {

  constructor(drawPlanet, getAngle, radius, orbitRadius, celestialParent) {
    this.drawPlanet = drawPlanet;
    this.getAngle = getAngle;
    this.orbitRadius = orbitRadius;
    this.celestialParent = celestialParent;
    this.radius = radius;

    this.position = new Point(0, 0, 0);
  }

  update() {
    push();
    if (this.celestialParent != null) {
      translate(this.celestialParent.position.x, this.celestialParent.position.y, this.celestialParent.position.z);
      // calculate current pos
      this.position.x = Math.sin(this.getAngle()) * this.orbitRadius;
      this.position.y = Math.cos(this.getAngle()) * this.orbitRadius;
      this.position.z = this.celestialParent.position.z;
    }
    translate(this.position.x, this.position.y, this.position.y);
    this.drawPlanet();
    pop();
  }

}


drawSun = function() {
  fill(240, 240, 0);
  ellipse(0, 0, this.radius * 2);
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


var star = new Planet(drawSun, getNoAngle, 100, 0, null);
star.satellite = new Planet(drawEarth, getSecondsAngle, 30, 300, star);
star.satellite.satellite = new Planet(drawMoon, getMillisAngle, 10, 70, star.satellite);


setup = () => {
  createCanvas(window.innerWidth, window.innerHeight, WEBGL);
}

draw = () => {
  var d = new Date();
  //rotateX(frameCount * 0.003);
  //rotateY(frameCount * 0.004);
  // box(d.getSeconds() + 1, d.getMinutes() + 1, d.getHours() + 1);

  //background(255);

  var dirY = (mouseY / height - 0.5) * 2;
  var dirX = (mouseX / width - 0.5) * 2;
  pointLight(255, 230, 230, 0.1, 0, 0, 0); //mouseX - width / 2, -mouseY + height / 2, 500);

  let currentPlanet = star;
  while (currentPlanet) {
    currentPlanet.update();
    currentPlanet = currentPlanet.satellite
  }
}
