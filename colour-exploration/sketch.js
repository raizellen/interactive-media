// must turn off loop protector in p5js web editor settings to run

var showDetails = false;
var changeColour = false;

var graphicsBuffer;
var mainHue = 0;

var r = 0;
var g = 0;
var b = 0;

function setup() {
  createCanvas(700,700);
  graphicsBuffer = createGraphics(700,700); // create a graphics buffer
  // drawing approx 250k pixels every iteration is extremely slow
  // better to create graphics object via offscreen drawing canvas then just loadthat
  drawGraphics(graphicsBuffer);
}


// iteration: lines to cursor
// colour: constructing a gradient and colour inspector
function draw() {
  // change background colour to stored rgb (calculated in previous iteration - default 0)
  if (changeColour){
    background(r, g, b);
  } else {
    background(0);
  }
    
  // TEXT
  noStroke();
  fill('grey');

  textStyle(ITALIC);
  textSize(12);
  text('hover mouse to display lines', 20, 640);
  text('click to change background colour', 20, 660);

  let detailsOffset = 0;

  if (showDetails){
    textStyle(BOLD);
    text('Graphical Elements', 550, 635);
    textStyle(NORMAL);
    text('Iteration: lines to cursor - takes the colour of where mouse hovers', 314, 650);
    text('Colour: constructing a gradient - using HSB colour mode', 362, 665);
    text('Colour: colour inspector - displays the RGB values of pixel', 353, 680);
    
    stroke('grey');
    strokeWeight(1);
    line(525,620,662,620);
    detailsOffset = 45;
  }
  
  fill(200);
  textStyle(NORMAL);
  textSize(16);
  text('Interactive Media A1B', 506, 640-detailsOffset);
  textStyle(ITALIC);
  textSize(10);
  text('press i for more information', 540, 655-detailsOffset);
  noStroke();

  image(graphicsBuffer,0,0); // display created graphics
  
  if (mouseX > 95 && mouseX < 605 && mouseY > 60 && mouseY < 570) {
    var colour = graphicsBuffer.get(mouseX, mouseY); // returns rgba of current pixel
    r = colour[0]; // saved for the background colour change
    g = colour[1];
    b = colour[2];
    stroke(r,g,b);
    strokeWeight(2);
    for (var i = 95; i <= 605; i+= 51){ // lines to the horizontal
      line(mouseX, mouseY, i, 61);
      line(mouseX, mouseY, i, 569);
    }
    for (var j = 60; j <= 570; j += 51){ // lines to the vertical
      line(mouseX, mouseY, 96, j);
      line(mouseX, mouseY, 604, j);
    }
    noStroke();
    text(`RGB: ${r}, ${g}, ${b}`, 94,585); // display rgb value
  }
}

function drawGraphics(pg){
  pg.noStroke(); // pg = created graphics
  pg.colorMode(HSB); // easier for gradient logic

  var bright = 0; // initial brightness

  // builds pixel by pixel
  for (var x = 95; x < 605; x += 1){
    tempHue = mainHue; // reset hue back every column
    for (var y = 60; y < 570; y += 1){
      pg.fill(tempHue,100,bright);
      pg.square(x,y,1);
      tempHue += 360/510; // 360 is hue range and 510 is no. of pixels down 
    }
      bright += 100/510; // add brightness as it goes across
    
  } 
}
  
// KEY COMMANDS
function keyPressed(){
  // DISPLAY ADDITIONAL INFORMATION
  if (key == 'i'){
    showDetails = !showDetails;
  }
}

function mousePressed(){
  // change background colour
  changeColour = !changeColour;
}