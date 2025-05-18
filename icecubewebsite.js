let boxSize;
let particles = [];
let particleCount = 900;
let particleRadius = 17;

let meltProgress = 0; // 0 = solid, 1 = liquid
let meltSpeed = 1 / (60 * 60); // melts over 60 seconds

let bgStart, bgEnd;
let clickCount = 0;

function easeInOutQuad(t) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

function mousePressed() {
  // Check if click is inside the reset button
  if (mouseX > 20 && mouseX < 140 && mouseY > 20 && mouseY < 60) {
    resetSketch();
  } else {
    // Speed up melting when mouse is clicked (max 2 clicks)
    if (clickCount < 2) {
      meltSpeed = min(meltSpeed * 3, 0.05); // Cap so it’s not instant
      clickCount++;
    }
  }
}

function resetSketch() {
  meltProgress = 0;
  meltSpeed = 1 / (60 * 60);
  clickCount = 0;
  particles = [];

  let boxX = (width - boxSize) / 2;
  let boxY = (height - boxSize) / 2;

  let attempts = 0;
  while (particles.length < particleCount && attempts < 10000) {
    let x = random(boxX + particleRadius, boxX + boxSize - particleRadius);
    let y = random(boxY + particleRadius, boxY + boxSize - particleRadius);

    let overlapping = false;
    for (let p of particles) {
      let d = dist(x, y, p.x, p.y);
      if (d < particleRadius * 2) {
        overlapping = true;
        break;
      }
    }

    if (!overlapping) {
      particles.push(new Particle(x, y));
    }
    attempts++;
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  boxSize = min(width, height) * 0.6;
  resetSketch();

  bgStart = color(10); // charcoal black
  bgEnd = color(3, 252, 244); // turquoise
}

function draw() {
  let bgCol;

  if (meltProgress < 0.7) {
    bgCol = bgStart;
  } else {
    let fadeAmtRaw = map(meltProgress, 0.7, 0.75, 0, 1);
    fadeAmtRaw = constrain(fadeAmtRaw, 0, 1);
    let fadeAmt = easeInOutQuad(fadeAmtRaw);
    bgCol = lerpColor(bgStart, bgEnd, fadeAmt);
  }

  background(bgCol);

  if (meltProgress < 1) {
    meltProgress += meltSpeed;
    meltProgress = constrain(meltProgress, 0, 1);
  }

  let boxX = (width - boxSize) / 2;
  let boxY = (height - boxSize) / 2;

  stroke(150);
  strokeWeight(0.5);
  noFill();
  rect(boxX, boxY, boxSize, boxSize);

  for (let p of particles) {
    p.update(boxX, boxY, boxSize);
    p.show();
  }

  // Draw the reset button
  fill(50, 150, 250);
  rect(20, 20, 120, 40);

  fill(255);
  noStroke();
  textSize(18);
  textAlign(CENTER, CENTER);
  text("new ice cube!", 80, 40);
}

class Particle {
  constructor(x, y) {
    this.originX = x;
    this.originY = y;
    this.x = x;
    this.y = y;
    this.r = particleRadius;

    this.offsetX = random(TWO_PI);
    this.offsetY = random(TWO_PI);

    this.vx = 0;
    this.vy = 0;
  }

  update(boxX, boxY, boxSize) {
    if (meltProgress < 0.7) {
      let wiggle = 1.5 + meltProgress * 4;
      this.x = this.originX + sin(frameCount * 0.1 + this.offsetX) * wiggle;
      this.y = this.originY + sin(frameCount * 0.1 + this.offsetY) * wiggle;
    } else {
      if (this.vy === 0 && this.y !== this.originY) {
        this.vy = random(0.1, 0.5);
      }

      let gravity = 0.2 * meltProgress;
      this.vy += gravity;

      this.x += this.vx;
      this.y += this.vy;

      let left = boxX + this.r;
      let right = boxX + boxSize - this.r;
      let top = boxY + this.r;
      let bottom = boxY + boxSize - this.r;

      if (this.y > bottom) {
        this.y = bottom;
        this.vy *= -0.6;
      }

      if (this.x < left) {
        this.x = left;
        this.vx *= -0.6;
      }
      if (this.x > right) {
        this.x = right;
        this.vx *= -0.6;
      }
    }
  }

  show() {
    noStroke();

    let r = lerp(255, 3, meltProgress);
    let g = lerp(255, 94, meltProgress);
    let b = lerp(255, 252, meltProgress);

    fill(r, g, b);
    ellipse(this.x, this.y, this.r * 2);
  }
}
