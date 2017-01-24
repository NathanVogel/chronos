

class Star {

  constructor(x, y, z, intensity) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.intensity = intensity;
  }

  draw() {
    fill(255);
    // ellipse(
    //   this.x * camera.zoom + camera.position.x + camera.position.x / this.z,
    //   this.y * camera.zoom + camera.position.y + camera.position.y / this.z,
    //   this.intensity / (camera.zoom * 3));
    ellipse(
      this.x + camera.position.x / this.z,
      this.y + camera.position.y / this.z,
      this.intensity);
  }
}


createStarrySky = () => {

  // systemStarCount = (systemSizeX * systemSizeY / (100 * 100)) * systemDensity;
  // console.log("Star count : " + systemStarCount);
  //
  // if (systemStarCount > 700) {
  //   systemStarCount = 700;
  // }

  stars = [];
  systemStarCount = Math.ceil(Math.random() * 500);

  let zmax = 80;

  for (let i = 0; i < systemStarCount; i++) {
    stars.push(new Star(
      Math.random() * (width + zmax),
      Math.random() * (height + zmax),
      2 + Math.random() * zmax,
      Math.random() * 3)
    );
  }
}


var worldTransition = {
  inProgress: false,
  dezooming: false,
  wandering: false,
  rezooming: false,
  rezoomingAlongCamera: false
}

updateStarrySky = () => {
  if (worldTransition.inProgress) {
    // Zoom out of the currentSystem
    if (worldTransition.dezooming) {
      currentScale *= 0.99;
      if (currentScale < 0.002) {
        worldTransition.dezooming = false;
        worldTransition.wandering = true;
      }
    }
    // Unzoom
    else if (worldTransition.rezooming) {
        currentScale *= 1.01;
        // if (currentScale > 0.5 && !worldTransition.rezoomingAlongCamera) {
        //   worldTransition.rezoomingAlongCamera = true;
        //   pickACamera();
        // }
        if (currentScale > 1) {
          pickACamera();
          worldTransition.rezoomingAlongCamera = false;
          worldTransition.rezooming = false;
          worldTransition.inProgress = false;
        }
    }
    // Wander among the stars
    else if (worldTransition.wandering) {
      worldTransition.wandering = false;
      worldTransition.rezooming = true;
      generateSolarSystem();
    }
  }

  // Draw the stars
  for (let i = 0; i < stars.length; i++) {
    stars[i].draw();
  }
}
