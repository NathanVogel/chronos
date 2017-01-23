

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
