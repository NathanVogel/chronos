

class Star {

  constructor() {
    this.setRandomValues();
  }

  // Initialize the star on the screen.
  setRandomValues() {
    let zmax = 80;
    this.x = Math.random() * (width);
    this.y = Math.random() * (height);
    this.z = 4 + Math.random() * zmax;
    this.intensity = Math.random() * 3;
  }

  // Calculate the x;y position of the star
  // only used for the transitions between worlds.
  update() {
    // Calculate the position relative to the direction center
    let fromCenterX = this.x - worldTransition.direction.x;
    let fromCenterY = this.y - worldTransition.direction.y;
    // If the star is too close, it'll go out of the screen too slowly
    if (Math.abs(fromCenterX) < 2) {
      fromCenterX = 2 * (fromCenterX > 0 ? 1 : -1);
    }
    if (Math.abs(fromCenterY) < 2) {
      fromCenterY = 2 * (fromCenterY > 0 ? 1 : -1);
    }
    // Move : Offset the position according to the current forward speed
    this.x += fromCenterX * worldTransition.speed - fromCenterX;
    this.y += fromCenterY * worldTransition.speed - fromCenterY;
    // If the new position is out of the screen -> reset as a new Star inside it.
    if (this.x < 0 || this.y < 0 || this.x > width || this.y > height) {
      this.setRandomValues();
    }
  }

  draw() {
    ellipse(
      this.x + camera.position.x / this.z,
      this.y + camera.position.y / this.z,
      this.intensity);
  }
}


createStarrySky = () => {
  stars = [];
  systemStarCount = 30 + Math.ceil(Math.random() * 400);
  worldTransition.direction.x = width / 2;
  worldTransition.direction.y = height / 2;

  for (let i = 0; i < systemStarCount; i++) {
    stars.push(new Star());
  }
}


var worldTransition = {
  inProgress: false,
  dezooming: false,
  wandering: false,
  rezooming: false,
  rezoomingAlongCamera: false,
  speed: 1,
  dezoomingSpeed: 1,
  direction: {
    x: 0,
    y: 0
  }
}

startWorldTransition = () => {
  justChangedCamera();
  justEndedTheWorld();
  worldTransition.inProgress = true;
  worldTransition.dezooming = true;
  worldTransition.wandering = false;
  worldTransition.wanderingBack = false;
  worldTransition.rezooming = false;
  planetToFollow = star;
  moveTo(0, 0, 3000, "easeInOutQuad");
  var aniDezoomSpeed = anime({
    targets: worldTransition,
    dezoomingSpeed: 0.985,
    easing: "easeInQuad",
    duration: 3000
  });
}

startWandering = () => {
  generateSolarSystem();
  worldTransition.dezooming = false;
  worldTransition.wandering = true;

  var aniHyperspaceSpeed = anime({
    targets: worldTransition,
    speed: 1.3,
    easing: "easeInExpo",
    duration: 6000,
    complete: function() {
      stopWandering();
    }
  });
}

stopWandering = () => {
  worldTransition.wandering = false;
  worldTransition.wanderingBack = true;
  worldTransition.direction.x = width/2;
  worldTransition.direction.y = height/2;

  setTimeout(function() {
    worldTransition.rezooming = true;
  }, 3500);

  var aniHyperspaceSpeed = anime({
    targets: worldTransition,
    speed: 1,
    easing: "easeOutSine",
    duration: 8000,
    complete: function() {
      worldTransition.wanderingBack = false;
      worldTransition.rezooming = true;
    }
  });
}


// Manages the animations of the stars and transitions between worlds.
// Called every frame from draw()
updateStarrySky = () => {
  if (worldTransition.inProgress) {
    // Dezoom out of the currentSystem
    if (worldTransition.dezooming) {
      currentScale *= worldTransition.dezoomingSpeed;
      // if we're far enough start moving through hyperspace
      if (currentScale < 0.002) {
        startWandering();
      }
    }
    // Wander among the stars
    if (worldTransition.wandering || worldTransition.wanderingBack) {
      for (let i = 0; i < stars.length; i++) {
        stars[i].update();
      }
      if (worldTransition.wandering) {
        worldTransition.direction.x = width / 2 + map(noise(0, frameCount / 70), 0, 1, -width/2, width/2);
        worldTransition.direction.y = height / 2 + map(noise(100, frameCount / 70), 0, 1, -height/2, height/2);
        fill(255, 0, 0);
      // ellipse(worldTransition.direction.x, worldTransition.direction.y, 5);
      }
    }
    // Rezoom into
    if (worldTransition.rezooming) {
      // The rezoom factor doesn't need to be animated,
      // since no smooth transition is required.
      // Beginning : it's a pixel. End : we directly start pickACamera
      currentScale *= 1 + 0.01;
      if (currentScale > 1) {
        pickACamera();
        worldTransition.rezoomingAlongCamera = false;
        worldTransition.wandering = false;
        worldTransition.wanderingBack = false;
        worldTransition.rezooming = false;
        worldTransition.inProgress = false;
      }
    }
  }

  // Draw the stars
  fill(255);
  for (let i = 0; i < stars.length; i++) {
    stars[i].draw();
  }
}
