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



var defaultCameraDuration = 4000;

// Change camera every 5 minutes.
var cameraFrequency = 1000 * 60 * 3;
var lastCameraPick;
justChangedCamera();

// Change world every hour.
var endOfTheWorldFrequency = 1000 * 60 * 60;
var lastEndOfTheWorld;
justEndedTheWorld();


function preload() {
  img_shadow = loadImage("img/shadow.png");
  img_mask = loadImage("img/mask1000.png");
}


var star,
  planetToFollow;
var backgroundColor;
var stars = [];
var currentScale = 1;
var maxSystemSpan,
  systemSizeX,
  ystemSizeY,
  systemStarCount = 0;
let planetResolution = 1024;
let density = 1 / planetResolution;
var planetMask;
var img_shadow;
var img_mask;
var pg_star;
var pg_starSat;
var pg_starSatAtm;
var pg_starSatSat;
var pg_starSatSatAtm;




/*********
 * SETUP *
 *********/
function setup() {
  createCanvas(window.innerWidth, window.innerHeight);
  backgroundColor = color(14);


  // ====== SOLAR SYSTEM =======

  // Planet mask
  planetMask = createGraphics(planetResolution, planetResolution);
  if (planetResolution == 1000) {
    planetMask.image(img_mask, 0, 0);
  } else {
    planetMask.noStroke();
    planetMask.fill(color('white'));
    planetMask.smooth();
    planetMask.ellipseMode(CENTER);
    planetMask.ellipse(planetResolution / 2, planetResolution / 2, planetResolution, planetResolution);
    planetMask.smooth();
  }
  planetMask.loadPixels();

  // p5 Graphics to bake textures
  pg_star = createGraphics(planetResolution * 2, planetResolution * 2);
  pg_starSat = createGraphics(planetResolution, planetResolution);
  pg_starSatSat = createGraphics(planetResolution, planetResolution);
  pg_starSatAtm = createGraphics(planetResolution, planetResolution);
  pg_starSatSatAtm = createGraphics(planetResolution, planetResolution);
  generateSolarSystem();


  // ====== SKY ======
  createStarrySky();

  // ====== CAMERA ======
  currentScale = getMatchingZoom(
    (star.satellite.orbitRadius + star.satellite.satellite.orbitRadius) * 2.1,
    Math.min(width, height)
  );
  pickACamera();

  // ====== SETUP ======
  imageMode(CENTER);
  rectMode(CENTER);
  ellipseMode(CENTER);
  noStroke();

}


// ======= SOLAR SYSTEM ======

generateSolarSystem = () => {
  let currentPlanet = star;
  while (currentPlanet) {
    // Unsuccessful attempt to clear the memory.
    let nextPlanet = currentPlanet.satellite;
    if (currentPlanet.pg) {
      currentPlanet.pg.remove();
    }
    if (currentPlanet.pgAtmosphere) {
      currentPlanet.pgAtmosphere.remove();
    }
    currentPlanet.celestialParent = null;
    currentPlanet.satellite = null;
    currentPlanet.pg = null;
    currentPlanet.pgAtmosphere = null;
    currentPlanet = nextPlanet;
  }
  planetToFollow = null;
  star = null;

  // Note : better to stay at small size, not sure why anymore (only in 3D ?)

  // The star radius contains the halo
  // Would happily do bigger stars, but then the planet would pass
  // too fast across the screen.
  let starRadius = 300 + Math.random() * 300;
  let planetRadius = 30 + Math.random() * 50;
  let planetDistance = starRadius + planetRadius + 10 + Math.random() * 240;
  let moonRadius = 6 + Math.random() * 20;
  let moonDistance = 2 * planetRadius + moonRadius + Math.random() * 60;
  let satelliteDistance = moonRadius + 5 + Math.random() * 20
  // Make sure the system doesn't touch the star
  planetDistance = Math.max(planetDistance, starRadius + moonDistance + satelliteDistance + 20);
  // Create the planets
  star = new Planet(generateSun, drawSun, getNoAngle, starRadius, 0, null, pg_star, null);
  star.satellite = new Planet(generateFractalGradientPlanet, drawPlanet, getMinutesAngle, planetRadius, planetDistance, star, pg_starSat, pg_starSatAtm);
  star.satellite.satellite = new Planet(generateGradientPlanet, drawPlanet, getSecondsAngle, moonRadius, moonDistance, star.satellite, pg_starSatSat, pg_starSatSatAtm);
  star.satellite.satellite.satellite = new Planet(null, drawSatellite, getMillisAngle, 2, satelliteDistance,
    star.satellite.satellite
  );
  planetToFollow = star;

  // Calculate the size of the system to draw to shadows that aren't infinite
  maxSystemSpan = getSystemSpan(star);
  systemSizeX = maxSystemSpan * 5;
  systemSizeY = systemSizeX;
}






// ====== DRAW ======
// Draw every frame
draw = () => {

  background(backgroundColor);

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
    // console.log("CURRENT : " + currentScale);
    camera.zoom = currentScale;
    camera.position.x = planetToFollow.position.x + Number(cameraOffset.x);
    camera.position.y = planetToFollow.position.y + Number(cameraOffset.y);
  // For some reason the camera offset is converted to a string by anime.js
  }

  // Draw the sky
  camera.off();
  updateStarrySky();
  camera.on();

  // We can now draw the planets

  if ((!worldTransition.wandering && !worldTransition.wanderingBack)
    || worldTransition.rezooming) {
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
        startWorldTransition();
      }
      // Check for camera after, as at every round hour, world gets prioritized
      else if (hhmmss.getTime() - lastCameraPick > cameraFrequency) {
        pickACamera();
      }
    }
  // hhmmss.updateTime();
  }
  // Regular event handling without hhmmss
  else if (!endingTheWorld) {
    if (new Date().getTime() - lastEndOfTheWorld > endOfTheWorldFrequency) {
      startWorldTransition();
    } else if (new Date().getTime() - lastCameraPick > cameraFrequency) {
      pickACamera();
    }
  }
}
