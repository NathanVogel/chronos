

// ====== PLANET ======
class Planet {

  constructor(generatePlanet, drawPlanet, getAngle, radius, orbitRadius, celestialParent, planetPG, atmospherePG) {
    this.pg = typeof planetPG !== 'undefined' ? planetPG : null;
    this.pgAtmosphere = typeof atmospherePG !== 'undefined' ? atmospherePG : null;
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

    // Atmosphere settings : TODO -10
    this.atmosphereSize = Math.floor(10+Math.random() * 40);
    if (this.atmosphereSize < 3) {
      this.atmosphereSize = 0;
      this.pgAtmosphere = null;
    }
    this.atmosphereOpacity = 10 + Math.random() * 70;

    // Noise settings
    this.horizontalNoiseScale = 0.5 + Math.random() * 10;
    this.horizontalNoiseStrength = Math.random() * 120;

    // Create the base planet graphic
    if (this.generatePlanet) {
      this.generatePlanet();
    }
    if (this.pgAtmosphere) {
      generateAtmosphere(this.radius, this.atmosphereSize, this.atmosphereOpacity, this.pgAtmosphere)
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
