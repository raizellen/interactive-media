var transform = 0;
var rgb = {
            r: 204,
            g: 153,
            b: 102
          };
var size = 1;
var corner = 0;
var neck = 0;
var offsetArm = 0;

var followMode = false;
var showDetails = false;

function setup() {
  createCanvas(700,700);
}


function draw() {
  background(20);
  rectMode(CORNERS);
  
  // TEXT
  let detailsOffset = 0; // to move text later when details shown
  noStroke();
  fill('grey');

  textStyle(ITALIC);
  textSize(12);
  text('press r/g/b to adjust colour', 20, 640);
  text('press m to toggle follow mode', 20, 660);
  text('click to morph', 20, 680);

  if (showDetails){
    textStyle(BOLD);
    text('Graphical Elements', 550, 635);
    textStyle(NORMAL);
    text('One With Everything: using a variety of shapes to form a picture', 322, 650);
    text('Draw Your Initials: monogram of initials, RLRN', 415, 665);
    text('Draw Then Code: a portrait', 516, 680);
    
    stroke('grey');
    strokeWeight(1);
    line(525,615,662,615);
    detailsOffset = 60;
  }
  
  fill(200);
  textStyle(NORMAL);
  textSize(16);
  text('Interactive Media A1A', 506, 650-detailsOffset);
  textStyle(ITALIC);
  textSize(10);
  text('press i for more information', 540, 665-detailsOffset);
  
  // FOLLOW MODE: loc relative to mouse when true
  if (followMode) {
    mX = mouseX-100*size; // offset a little so that the cursor isn't on the corner
    mY = mouseY-100*size;
  } else {
    mX = 0;
    mY = 0;
  }
  
  // DRAW
  noFill();
  stroke(rgb.r, rgb.g, rgb.b);
  strokeWeight(3*size);
  rect(52+mX, 50+mY,
          150*size+mX, 90*size+mY, corner); // main curve R
  bezier(100*size+mX, 90*size+mY,
          95*size+mX, 90*size+neck/3+mY, 
          95*size+mX, 90*size+2*neck/3+mY,
          100*size+mX, 90*size+neck+mY); // neck
  line(100*size+mX, 90*size+neck+mY,
          200*size+mX,200*size+mY); // diagonal
  line(200*size+mX, 200*size+mY,
          200*size+offsetArm+mX,90*size+mY); // N left
  rect(145*size-corner/2+mX, 55+corner/2+mY,
          145*size+mX, 85*size-corner+mY, corner); // eye
  
  strokeWeight(4*size);
  line(70*size+mX, 169*size+mY,
          120*size+offsetArm+mX, 169*size+offsetArm+mY); // horizantal line on L
                    
  strokeWeight(2*size);
  line(95*size+mX, 95*size+neck+mY,
          195*size+mX, 205*size+mY); // thin diagonal
          
  fill(rgb.r, rgb.g, rgb.b);
  rect(50+mX, 50+mY, 
          70*size+mX, 170*size+mY,
          corner,0,0,corner); // thickest full rectangle
  circle(200*size+offsetArm+mX, 90*size+mY, 20*(size/2)); // circle top N
  circle(120*size+offsetArm+mX, 168*size+offsetArm+mY, 20*(size/2)); // circle on L
  
  // MORPHING
  switch(transform) {
    case 0:
      size = 1;
      corner = 0;
      neck = 0;
      offsetArm = 0;
      break;
      
    case 1:
      size = 1.5;
      corner = 20;
      neck = 20;
      offsetArm = 10;
      break;
      
    case 2:
      size = 2;
      corner = 50;
      neck = 30;
      offsetArm = 30;
      beginShape(); // hair w/ fill ^^
      vertex(200+mX, 50+mY);
      bezierVertex(170+mX, 100+mY,
              180+mX, 300+mY,
              140+mX, 330+mY);
      vertex(140+mX, 50+mY);
      endShape();
      break;
      
    case 3:
      size = 3;
      corner = 100;
      neck = 50;
      offsetArm = 50;
      beginShape(); // hair w/ fill ^^
      vertex(350+mX, 50+mY);
      bezierVertex(250+mX, 100+mY,
              270+mX, 400+mY,
              210+mX, 500+mY);
      vertex(210+mX, 50+mY);
      endShape();
      noFill();
      arc(410+mX, 220+mY, 
              100, 30, HALF_PI, PI); // mouth lol
      bezier(450+mX, 150+mY, // nose
              460+mX, 170+mY, 
              485+mX, 205+mY, 
              450+mX, 200+mY);
      break;
  }
}

// MORPHING COMMAND
function mousePressed() {
  if (transform < 3) { // guard so it won't process after reaching final state
    transform += 1;
    setTimeout(function() { // execute after a delay (5 secs)
      transform -= 1;
    }, 5000); // ms
  }
}

// KEY COMMANDS
function keyPressed(){
  // CHANGE COLOUR
  for (var colour in rgb) {
    if (key == colour) {
      rgb[colour] += 51; // factor of 255! so it has option for white
      if (rgb[colour] > 255){
        rgb[colour] = 0;  
      }
    }
  }
  
  // TOGGLE FOLLOW MODE
  if (key == 'm'){
    followMode = !followMode; // flip boolean value
  }
  
  // DISPLAY ADDITIONAL INFORMATION
  if (key == 'i'){
    showDetails = !showDetails;
  }
}
