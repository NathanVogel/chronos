

class Star {

  constructor(x, y, z, intensity) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.z = 5 + Math.random() * 5;
    this.intensity = intensity;
  }

  update() {
    fill(255);
    ellipse(
      this.x + camera.position.x / this.z,
      this.y + camera.position.y / this.z,
      this.intensity / (camera.zoom * 3));
  }
}


createStarrySky = () => {
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
        Math.random() * 5)
      );
    }
}


updateStarrySky = () => {
  for (let i = 0; i < stars.length; i++) {
    stars[i].update();
  }
}
