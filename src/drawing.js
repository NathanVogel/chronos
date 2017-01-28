
// ====== System Parts draw ======


generateFractalGradientPlanet = function() {
  this.pg.resetMatrix();
  this.pg.clear();
  generate(this.pg.drawingContext);
  // Apply our planet mask.
  this.pg.loadPixels();
  for (let i = 3; i < this.pg.pixels.length; i += 4) {
    this.pg.pixels[i] = planetMask.pixels[i - 1];
  }
  this.pg.updatePixels();
}


generateGradientPlanet = function() {
  this.pg.resetMatrix();
  this.pg.clear();
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


generateAtmosphere = function(realRadius, atmosphereHeight, opacity, pgA) {;
  let w = 0.8;
  let m = atmosphereHeight * planetResolution/realRadius;
  let o = opacity
  let radius = planetResolution;
  let graphicWidth = planetResolution + m;

  pgA.resetMatrix();
  pgA.clear();
  // I used to have a graphic size of planetResolution + m for the atmosphere.
  // But since it's just a blurry halo, the same as planetResolution is enough.
  // so this simple scale makes the conversion from what it should be if
  // it was the same scale as the planet. (can be 2700px +)
  pgA.scale(planetResolution/graphicWidth)
  pgA.translate(graphicWidth / 2, graphicWidth / 2);
  pgA.ellipseMode(CENTER);
  // Helps again certain artefacts
  pgA.strokeCap(SQUARE);
  pgA.strokeWeight(w);
  pgA.noFill();
  // Inner atmosphere
  for (let i = 0; i < radius; i += w) {
    pgA.stroke(255, 255, 255, pow((1 - i / radius), 4) * o);
    pgA.ellipse(0, 0, (radius - i));
  }
  // Outer atmosphere
  for (let i = 0; i < m; i += w) {
    pgA.stroke(255, 255, 255, pow((i / m) / 2, 4) * o * 16);
    pgA.ellipse(0, 0, radius + m - i);
  }
  return pgA;
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
  if (this.pgAtmosphere) {
    let s =  2 * (this.radius + this.atmosphereSize);
    image(this.pgAtmosphere, 0, 0, s, s);
  } else {
    drawAtmosphere(this.radius, this.atmosphereSize, this.atmosphereOpacity);
  }
  // Draw a shadow over the planet
  drawOvershadow(this.radius, angleToStar(this));
}




generateSun = function() {
  this.pg.resetMatrix();
  this.pg.clear();
  this.pg.translate(this.pg.width / 2, this.pg.height / 2);
  this.pg.ellipse(CENTER);


  let c = getRandomColor();
  let starCenterColor = color(250, 230, 220);
  let gScale = 20;

  let w = 0.8;
  let m = this.pg.width / 2 * (0.2 + 0.5 * Math.random());
  let o = 55 + 200 * Math.random();
  let radius = this.pg.width / 2 - m;
  this.sunRatio = radius / this.pg.width / 2;

  this.pg.fill(starCenterColor);
  this.pg.ellipse(0, 0, radius * 2);

  this.pg.strokeWeight(w);
  this.pg.strokeCap(SQUARE);
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


drawSun = function() {
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
  image(img_shadow, 0, 0, radius * 2, radius * 2);
  pop();
}


// Draw the shadow projected by the sun.
drawProjectedshadow = function(radius, angle) {
  let ratio = star.satellite.orbitRadius / star.radius;
  let alpha = Math.min(0.55, ratio - star.sunRatio);
  if (alpha < 0) {
    alpha = 0;
  }
  // Make the shadow disappear while unzooming
  alpha *= constrain(map(currentScale, 0.1, 0.5, 0, 1), 0, 1);

  push();
  rotate(angle);
  fill('rgba(0, 0, 0, ' + alpha + ')');
  noStroke();
  rectMode(CORNER);
  rect(-systemSizeX, -radius, systemSizeX, radius * 2);
  pop();
}


// Fallback, previous method for drawing an atmosphere.
drawAtmosphere = function(radius, size, opacity) {
  let w = 0.1;
  let m = size;
  let o = opacity;
  strokeWeight(w);
  noFill();
  // Inner atmosphere
  for (let i = 0; i < radius; i += w) {
    stroke(255, 255, 255, pow((1 - i / radius), 4) * o * 2);
    ellipse(0, 0, 2 * (radius - i));
  }
  // Outer atmosphere
  for (let i = 0; i < m; i += w) {
    stroke(255, 255, 255, pow((i / m) / 2, 4) * o * 16);
    ellipse(0, 0, radius * 2 + m - i);
  }
}
