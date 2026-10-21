// originally inspired by the burn book lol 
// but the ascii reminded me of old retro arcade games 
// dont forget to attach font file!

// to run, must have the font file or switch it out
// camera permission also required

var showDetails = false;

var cameraCapture;
var characters = "@%#*+=-:. "; // from the exercise desc "10 levels of grey"
var colour = 0;

var burning = false;
var burnProgress = 0; // 0 = not started, 1 = done
var burnStartTime = 0;

async function setup() {
  createCanvas(700,700);
  noStroke();
  rectMode(CORNERS);
  colorMode(HSB);
  thickFont = await loadFont("../../assets/fonts/thickFont.ttf"); // own font :)

  // webcam
  cameraCapture = createCapture(VIDEO);
  cameraCapture.size(43,33); // each cam px equivalent to 5x5 px on canvas
  cameraCapture.hide();
}

function draw() {
  background(37, 93, 99);
  drawMachine();
  displayText();

  push();
  cameraCapture.loadPixels();
  var cellW = 430 / cameraCapture.width; // stretch across 430 px wide
  var cellH = 330 / cameraCapture.height;
  
  for (var y = 0; y < cameraCapture.height; y++) {
    for (var x = 0; x < cameraCapture.width; x++) {
      // flip horizontally, minus 1 for index number
      var reverseX = cameraCapture.width-1-x;

      // y*width gets the num of pixels completed from prev rows
      // times 4 cause it is stored rgba
      var index = (reverseX+y*cameraCapture.width)*4;
      // get each rgb values of the specific pixels
      var r = cameraCapture.pixels[index];
      var g = cameraCapture.pixels[index + 1];
      var b = cameraCapture.pixels[index + 2];

      // get avg val since they all scale 255
      var bright = (r+g+b)/3;
  
      // choose ASCII character
      let charIndex = floor(map(bright,0,255,
                                0,characters.length-1));
  
      var c = characters.charAt(charIndex);
      var xPos = 140 + x * cellW; // offset 140
      var yPos = 140 + y * cellH;

      // disappearing effect thing
      if (burning) {
        var burnDistance = dist(xPos, yPos, 350, 300); 
        // if dist of char from centre of screen is less than
        // burnProgress (essentially like a percentage) of total distance needed
        if (burnDistance < burnProgress * dist(130, 130, 350, 300)) {
          continue; // move on to next increment (ie do not draw char)
        }
      }
      
      // ascii styling
      textFont("Courier New");
      textAlign(CENTER, CENTER);
      fill(colour,100,100);
      textStyle(BOLD);
      textSize(8);
      text(c, xPos, yPos);
    }
  }
  pop();

  if (burning) {
    burnProgress = (millis() - burnStartTime)/5000; // 5000ms (5s)
    if (burnProgress >= 1) {
      burning = false; // stop the burn!
    }
  }
}

function drawMachine(){
  push();
  textAlign(CENTER, CENTER);
  fill(262, 100, 60);
  rect(100,100,600,550); // border
  rect(80,80,620,20); //top
  rect(0,590,700,700); // bottom
  
  fill(262, 100, 30);
  quad(100,550,600,550,700,590,0,590); // bottom slant
  quad(100,100,80,80,620,80,600,100); // top slant
  fill(0);
  
  textFont(thickFont);
  textSize(50);
  fill(colour,100,100);
  text('ARCADE GAME',352,52);
  fill(20, 100, 100);
  text('ARCADE GAME',350,50);
  fill(0);
  rect(125,125,575,475); // screen

  // controls (buttons, joystick)
  for (var i = 0; i <= 250; i += 250){
    fill(326, 100, 62);
    ellipse(150+i,570,50,20);
    fill(5, 6, 69);
    rect(145+i,505,155+i,570);
    fill(356, 91, 95);
    ellipse(150+i,500,30);

    for (var j = 0; j <= 50; j+= 50){
      fill(20, 100, 100);
      ellipse(220+i+j,573,30,12);
      fill(44, 100, 100);
      ellipse(220+i+j,570,20,10);   
    }
  }
  
  drawButton();
  pop();
}

function drawButton(){
  push();
  fill(198, 76, 63);
  rect(450,490,550,530);

  noStroke();
  fill(197, 54, 33);
  textFont(thickFont);
  textSize(24);
  if (burning) {
    text("RESET",500,510);
  } else {
    text("START",500,510);
  }
  pop();
}

function displayText(){
  push();
  fill(170);
  textStyle(ITALIC);
  textSize(12);
  text('press c to change colour', 20, 640);
  text('press start to start 5 second "burnaway"', 20, 660);

  let detailsOffset = 0;

  if (showDetails){
    textStyle(BOLD);
    text('Graphical Elements', 550, 650);
    textStyle(NORMAL);
    text('Time and Interactivity: fuse (or progress bar) - burn', 392, 665);
    text('Typography: ascii vision - screen display', 447, 680);
    
    stroke('white');
    strokeWeight(1);
    line(525,635,662,635);
    detailsOffset = 30;
  }

  noStroke();
  fill(200);
  textStyle(NORMAL);
  textSize(16);
  text('Interactive Media A1E', 506, 640-detailsOffset);
  textStyle(ITALIC);
  textSize(10);
  text('press i for more information', 540, 655-detailsOffset);
  pop();
}

function mousePressed(){
  if (mouseX > 450 && mouseX < 550 &&
      mouseY > 490 && mouseY < 530) {
    burnProgress = 0; // reset brunProgress
    burning = !burning; // flip boolean
    if (burning) {
      burnStartTime = millis(); // record start time
    }
  }
}

function keyPressed(){
  if (key == 'i'){
    showDetails = !showDetails;
  }
  if (key == 'c'){
    colour += 60;
    if (colour >= 360){
      colour = 0;
    }
  }
}