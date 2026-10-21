var showDetails = false;
var singleColour = false;

var colours1 = [];
var colours2 = [];

var tiles = [];
var smoke = [];

function setup() {
  createCanvas(700, 700);
  rectMode(CORNERS);
  noStroke();

  colours1 = [color(255, 205, 178),color(255, 201, 113),color(201, 228, 202)];
  colours2 = [color(255, 180, 162),color(255, 182, 39),color(135, 187, 162)];

  createTiles();
}

function draw() {
  background(70,30,25);
  
  for (var tile of tiles){
    tile.display();
  }
  
  drawStove();
  drawSmoke();
  drawDetails();
  displayText();
}

function drawDetails(){
  push();
  // rangehood
  fill(230, 204, 178);
  rect(200,80,500,180);
  fill(221, 184, 146);
  quad(200,180,500,180,510,220,190,220);
  fill(176, 137, 104);
  rect(190,220,510,240);

  // shelf for accent
  fill(150,90,60);
  rect(190,140,510,160);
  pop();
}

function drawStove(){
  push();
  // bench
  fill(230, 204, 178);
  quad(100,450,600,450,
      620,530,80,530);
  fill(176, 137, 104);
  rect(80,530,620,580);

  // stovetop
  fill(221, 184, 146);
  quad(185,465,515,465,
       525,515,175,515);
  for (var i = 0; i < 2; i++){ // second for depth (diff colours)
    if (i == 0){
      fill(80);
    } else {
      fill(100);
    }
    ellipse(280,480-3*i,90-5*i,15-5*i);
    ellipse(275,500-3*i,100-5*i,20-5*i);
    ellipse(420,480-3*i,90-5*i,15-5*i);
    ellipse(425,500-3*i,100-5*i,20-5*i);
  }

  // knobs
  for (var x = 200; x <= 500; x += 100){
    fill(156, 102, 68);
    circle(x, 555, 30); //shadow
    
    fill(160, 120, 100); // main
    circle(x, 560, 25);
    
    push();
      translate(x,560);
      fill(127, 85, 57);
      rotate((mouseX-350)/360);
      rect(-5,-10,5,10);
    pop();
  }
  drawFire(280, 450, 3/4);
  drawFire(420, 450, 3/4);
  drawFire(280, 470, 1);
  drawFire(420, 470, 1);
  pop();
}

function drawFire(x, y, size){
  push();
  if (mouseX > 350){
    translate(x, y); // move so that i can scale for the ones at back
    scale(size);
    
    var bright = mouseX-350;
    
    // glow thing
    fill(255,180,60,bright/3);
    ellipse(0,0,90,80);
    
    // outer flame
    fill(255,120,30,bright/4);
    beginShape();
      vertex(10,30);
      vertex(-10,30);
      vertex(-35,10);
      vertex(-25,-25);
      vertex(-10,-10);
      vertex(0,-45);
      vertex(10,-10);
      vertex(20,-30);
      vertex(25,0);
    endShape(CLOSE);
    
    // transition
    fill(255,200,50,bright/4);
    beginShape();
      vertex(5,30);
      vertex(-5,30);
      vertex(-20,5);
      vertex(-15,-2);
      vertex(-5,3);
      vertex(2,-8);
      vertex(5,3);
      vertex(15,-10);
      vertex(17,0);
    endShape(CLOSE);
    
    // inner
    fill(255,240,150,bright/4);
    beginShape();
      vertex(0,30);
      vertex(-10,10);
      vertex(0,15);
      vertex(10,5);
    endShape(CLOSE);
  }
  pop();
}

function drawSmoke(){
  if (mouseX > 350){ // only on right side (ie fire on)
    if (random(350,3000) < mouseX){
      // smoke has [x, y, width, height, xspeed]
      // didn't want to have to make an entire class for it
      smoke.push([280+random(-15,15), 400, 
                  random(10,30),random(5,20),random(-0.3,0.3)]);
      smoke.push([420 +random(-15,15),400,
                  random(10,30),random(5,20),random(-0.3,0.3)]);
    }

    fill(100,(mouseX-350)/10); // link opacity to mouse

    for (var i = 0; i < smoke.length; i++){
      ellipse(smoke[i][0], smoke[i][1], smoke[i][2], smoke[i][3]);
      smoke[i][0] += smoke[i][4]; // add xspeed to x
      smoke[i][1] -= 1; // y-1

      if (smoke[i][1] < 240){
        smoke.splice(i, 1); // remove smoke object
      }
    }
  }
}

function createTiles(){
  tiles = [];
  var tempColour; // if not single mode, decide per tile ie in for loop
  if (singleColour){
    tempColour = floor(random(0,3)); // if single decide beforehand
  }
  for (var x = 100; x < 600; x+=50){
    for (var y = 80; y < 480; y+=50){
      if (!singleColour){
        tempColour = floor(random(0,3)); // floor to ensure its a whole num
      }
      tiles.push(new Tile(x,y,random([0,PI/2]),
                          colours1[tempColour],colours2[tempColour]));
    }
  }
}

class Tile {
  constructor(x,y,rotation,colour1,colour2){
    this.x = x;
    this.y = y;
    this.rotation = rotation;
    this.colour1 = colour1;
    this.colour2 = colour2;
    this.inverted = random([true,false]); // decide arc color
  }

  display(){
    push();
    translate(this.x+25,this.y+25); // centre of tile
    rotate(this.rotation);
    if (this.inverted){
      this.baseTile(this.colour2, this.colour1);
    } else {
      this.baseTile(this.colour1, this.colour2);
    }
    pop();
  }

  baseTile(c1,c2){
    fill(c1);
    rect(-25,-25,25,25);
    fill(c2);
    arc(-25,-25,50,50,0,PI/2);
    arc(25,25,50,50, PI,PI+PI/2);
  }
}

function displayText(){
  push();
  // TEXT
  fill(170);

  textStyle(ITALIC);
  textSize(12);
  text('click to change tiles arrangement', 20, 620);
  text('press s for single colour theme backsplash', 20, 640);
  text('move mouse to left for fire, right for off', 20, 660);

  let detailsOffset = 0;

  if (showDetails){
    textStyle(BOLD);
    text('Graphical Elements', 550, 650);
    textStyle(NORMAL);
    text('Conditional Testing: left or right - fire control', 430, 665);
    text('Unpredictability: duotone truchet tiling - kitchen backsplash', 349, 680);
    
    stroke('grey');
    strokeWeight(1);
    line(525,635,662,635);
    detailsOffset = 30;
  }

  noStroke();
  fill(200);
  textStyle(NORMAL);
  textSize(16);
  text('Interactive Media A1C', 506, 640-detailsOffset);
  textStyle(ITALIC);
  textSize(10);
  text('press i for more information', 540, 655-detailsOffset);
  pop();
}

// controls
function mousePressed(){
  createTiles();
}

function keyPressed(){
  if (key == 'i'){
    showDetails = !showDetails;
  }
  if (key == 's'){
    singleColour = !singleColour;
    createTiles();
  }
}