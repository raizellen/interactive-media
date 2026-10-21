var showDetails = false;

var items = [];
var colours = {};
var mousePositions = [];

var draggedItem = null;
var offsetX = 0;
var offsetY = 0;

function setup() {
  createCanvas(700, 700);
  rectMode(CORNERS);
  noStroke();

  colours = {
    blue: color(98,141,189),
    salmon: color(250,128,114),
    green: color(133,204,111),
    darkgreen: color(120,170,100),
    coral: color(248,177,149),
    pink: color(246,114,128),
    purple: color(192,108,132),
    violet: color(108,91,123),
    darkblue: color(53,92,125),
    mint: color(168,230,206),
    brown: color(188,158,130),
    yellow: color(248,222,126)
  };

  drawStarter();
}

function draw() {
  background(112,70,45);

  displayText();
  
  // table
  fill(colours.coral);
  rect(100,80,600,560);
  
  for (var i = 0; i < items.length; i++) {
    items[i].display();
  }

  drawPenTrail();
  drawFixtures();
}

function drawStarter(){
  items = []; // clear array
  // static
  items.push(new Item(random(100,400), random(160,480), 200, 80, 
                    random(-0.05,0.05), colours.blue, 'keyboard'));
  items.push(new Item(random(100,540), random(180,460), 60, 100, 
                    random(-0.05,0.05), colours.violet, 'phone'));
  items.push(new Item(random(100,580), random(200, 450), 10, 100, 
                    random(-0.05,0.05), colours.purple, 'pen'));

  // movable
  items.push(new Item(random(100,510), random(180,450), 80, 100, 
                      random(-0.05,0.05), colours.yellow, 'notepad'));
  items.push(new Item(random(100,520), random(180,480), 80, 100, 
                      random(-0.05,0.05), colours.brown, 'clipboard'));
  items.push(new Item(random(100,430), random(180,540), 150, 15, 
                      random(-0.05,0.05), colours.brown, 'ruler'));
  items.push(new Item(random(100,500), random(180,450), 
                      random(70,100), random(120,130), 
                      random(-0.05,0.05), color(255), 'paper'));
}

function drawPenTrail(){
  push();
  noFill();
  stroke(colours.salmon);
  strokeWeight(5);

  beginShape();
  for (var i = 0; i < mousePositions.length; i++){
    vertex(mousePositions[i][0], mousePositions[i][1]);
    // basically first [] is row/object/whatever, second [] is index position
  }
  endShape();
  pop();
}

function drawFixtures() {
  push();
    // computer
    fill(colours.violet);
    quad(220,150, 490,150,
         450,190, 250,190);
    rect(220,150,490,140);
    rect(280,140,430,130);
    fill(0,50);
    rect(280,140,430,130); // darken
    fill(colours.mint);
    quad(230,155, 480,155,
         450,185, 250,185);
  
    // lamp
    push();
      fill(150);
      translate(160,180);
      rotate(PI/4); // angled
      ellipse(0,0,100,80);
      fill(180,250,150,100);
      circle(80,0,100);
      fill(colours.darkblue);
      rect(10,5,-70,-5,5);
      circle(30,0,80);
      fill(colours.mint);
      circle(10,0,50);
    pop();
  
    // plant
    push();
      translate(540,170);
      strokeWeight(5);
      stroke(220);
      fill(colours.brown);
      circle(0,0,70);
      noStroke();
      for (var cycle = 0; cycle < 2; cycle++){
        var leafLength = 44;
        if (cycle == 0){
          fill(colours.darkgreen);
        } else {
          fill(colours.green);
          leafLength +=4;
        }
        for (var i = 0; i < 6; i++){
          rotate(PI/3);
          ellipse(0,leafLength/2,12,leafLength);
        }
        rotate(PI/6);
      }
    pop();
    
  pop();
}

function displayText(){
  push();
  fill(170);

  textStyle(ITALIC);
  textSize(12);
  text('n: new notepad   |   r: reset', 20, 600);
  text('backspace: remove top most item', 20, 620);
  text('click to bring to front', 20, 640);
  text('drag pen to draw', 20, 660);

  let detailsOffset = 0;

  if (showDetails){
    textStyle(BOLD);
    text('Graphical Elements', 550, 635);
    textStyle(NORMAL);
    text('Arrays: reordering rectangles - pick up stationery', 404, 650);
    text('Arrays: living lines i - pencil drawing', 472, 665);
    
    stroke('grey');
    strokeWeight(1);
    line(525,620,662,620);
    detailsOffset = 30;
  }

  noStroke();
  fill(200);
  textStyle(NORMAL);
  textSize(16);
  text('Interactive Media A1D', 506, 625-detailsOffset);
  textStyle(ITALIC);
  textSize(10);
  text('press i for more information', 540, 640-detailsOffset);
  pop();
}

class Item {
  constructor(x,y,w,h,rotation,colour,type){
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.rotation = rotation;
    this.colour = colour;
    this.type = type;
  }

  display(){
    push();

    var tempRotation;
    if (this.isHovering() || draggedItem == this) {
      tempRotation = 0;
    } else {
      tempRotation = this.rotation;
    }
    
    fill(this.colour);
    translate(this.x, this.y);
    rotate(tempRotation);
    rect(0, 0, this.w, this.h);

    switch(this.type) {
      case 'notepad': { 
        // wasn't working before, realised that to use
        // for loops in switch case, need curly brackets
        stroke(255);
        for (let i = 10; i < this.h; i += 15) {
          line(10, i, this.w - 10, i);
        }
        break;
      }
      case 'keyboard': {
        fill(0, 50);
        for (var row = 0; row < 5; row++) {
          for (var col = 0; col < 11; col++) {
            if (!(row == 4 && col > 2 && col < 7)){
              rect(10+col*17, 10+row*12,22+col*17, 20+row*12);
            }
          }
        }
        rect(61,58,124,68);
        break;
      }
      case 'phone':
        fill(colours.mint);
        rect(5, 10, this.w - 5, this.h - 10);
        break;
      case 'clipboard': {
        fill(255);
        rect(10,10,this.w-10,this.h-10);
        fill(colours.violet);
        rect(this.w/2-15,5,this.w/2+15,15);
        break;
      }
      case 'ruler': {
        stroke(0, 100);
        for (var i = 10; i < this.w; i += 10) {
          line(i, 0, i, this.h/2);
        }
        break;
      }
      case 'pen':
        fill(220);
        rect(0, 0, this.w, 15);
        break;
    }
    pop();
  }
  
  isHovering(){
    return mouseX > this.x &&
           mouseX < this.x + this.w &&
           mouseY > this.y &&
           mouseY < this.y + this.h;
  }
}

function mousePressed(){
  // check from item at front to back 
  // (last in array cause that's drawn last)
  for (var i = items.length - 1; i >= 0; i--){
    if (items[i].isHovering()){
      
      // bring selected item to front
      draggedItem = items.splice(i, 1)[0]; // remove item essentially and store in var
      items.push(draggedItem); // push it back in at the end (top)

      // remember where on the item we clicked and set position based off offset
      offsetX = mouseX - draggedItem.x;
      offsetY = mouseY - draggedItem.y;

      break;
    }
  }
}

function mouseDragged(){
  if (draggedItem != null){
    draggedItem.x = mouseX - offsetX;
    draggedItem.y = mouseY - offsetY;

    if (draggedItem.type == 'pen'){
      mousePositions.push([mouseX, mouseY]);
      if (mousePositions.length > 100){
        mousePositions.shift(); // remove from first element so it stores only 100 pos
      }
    }
  }
}

function mouseReleased(){
  if (draggedItem != null){ // check before it tries to access type
    if (draggedItem.type == 'pen'){
      mousePositions = [];
    }
    draggedItem = null;
  }
}

// KEY COMMANDS
function keyPressed(){
  // DISPLAY ADDITIONAL INFORMATION
  if (key == 'i'){
    showDetails = !showDetails;
  }
  if (key == 'n'){
    items.push(new Item(random(100,510), random(180,450), 80, 100, 
                      random(-0.05,0.05), random(Object.values(colours)), 'notepad'));
  }
  if (key == 'r'){
    drawStarter();
  }
  if (key == 'Backspace'){
    items.pop();
  }
}