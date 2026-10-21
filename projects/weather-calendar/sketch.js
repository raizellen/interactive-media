var showDetails = false;
var temperatureMode = true;

var tempImg = [];
var rainImg = [];
var tempFiles = [
  "../../assets/images/weather-calendar-images/hot.png",
  "../../assets/images/weather-calendar-images/chill.png",
  "../../assets/images/weather-calendar-images/cold.jpg"
];
var rainFiles = [
  "../../assets/images/weather-calendar-images/sunny.jpg",
  "../../assets/images/weather-calendar-images/cloudy.jpg",
  "../../assets/images/weather-calendar-images/rain.jpg"
];

var days = [];  // store day, min, max, rain data
var tiles = [];

// temperature and rainfall calendar, drawn once after parsing
var tempBuf;
var rainBuf;

var months = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
              "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];

var yr = 2026;
var monthNo = 0;
var startDay = 0; // weekday the month starts on (0 = sunday)

async function setup() {
  createCanvas(700, 700);
  noStroke();
  rectMode(CORNERS);

  for (var f of tempFiles) {
    tempImg.push(makeCircle(await loadImage(f)));
  }
  for (var f of rainFiles) {
    rainImg.push(makeCircle(await loadImage(f)));
  }
  // data taken from bom, can download csv and load file into here
  var data = await loadStrings("../../assets/data/weather-calendar-data/january.csv");
  parseWeather(data);
}

// crops an image to a square, then cuts it into a circle
function makeCircle(img) {
  var side = min(img.width, img.height);
  // square crop from the middle
  var pic = img.get((img.width - side) / 2, (img.height - side) / 2, side, side);

  // white circle on a see-through canvas, mask() keeps only where the circle is
  var m = createGraphics(side, side);
  m.pixelDensity(1);
  m.noStroke();
  m.fill(255);
  m.circle(side/2, side/2, side);
  pic.mask(m);
  m.remove();

  return pic;
}

function parseWeather(data) {
  for (var d of data) {
    var parts = d.split(",");
    // data rows look like: ,2026-09-1,10.6,23.5,0,...
    // skip the line if its too short or column 1 isnt a date
    if (parts.length < 5 || !/^\d{4}-\d{1,2}-\d{1,2}$/.test(parts[1])) continue;
    var date = parts[1].split("-"); // split the date into [year, month, day]
    yr = int(date[0]); // year as a number
    monthNo = int(date[1]) - 1; 
    // month as a number, minus 1 because js counts months from 0

    days.push({
      day: int(date[2]),
      min: parseFloat(parts[2]),
      max: parseFloat(parts[3]),
      rain: parseFloat(parts[4]) // in mm
    });
  }

  // which weekday the 1st lands on
  startDay = new Date(yr, monthNo, 1).getDay();
  tiles = [];
  for (var i = startDay; i < startDay + days.length; i++) {
    // i is the grid slot, i - startDay is index to get days data
    tiles.push(new Tile(days[i - startDay], i));
  }

  // draw both calendars once
  tempBuf = makeBuffer(true);
  rainBuf = makeBuffer(false);
}

function makeBuffer(useTemp) {
  var pg = createGraphics(width, height);
  pg.pixelDensity(1);
  pg.noStroke();
  for (var tile of tiles) {
    tile.drawTile(pg, useTemp);
  }
  pg.loadPixels(); // save the pixels into an array for fast lookup
  return pg;
}

function draw() {
  background(0);

  push();
  textStyle(BOLD);
  textSize(70);
  fill(255, 40);
  text(months[monthNo], 105, 140);
  pop();

  // if temp mode load tempBuf else rain
  image(temperatureMode ? tempBuf : rainBuf, 0, 0);

  displayText();
  drawTitle();

  // find the tile the mouse is over
  var hovered = null;
  for (var tile of tiles) {
    if (tile.isHovered()) {
      hovered = tile;
    }
  }
  if (hovered) {
    drawData(hovered.data);
  }
}

function drawTitle() {
  push();
  fill(200);
  if (temperatureMode) {
    textSize(18);
    text("TEMP / ", 20, 610);
    textSize(12);
    text("RAIN", 85, 610);
  } else {
    textSize(12);
    text("TEMP", 20, 610);
    textSize(18);
    text("/ RAIN", 60, 610);
  }
  pop();
}

function pickTemp(maxTemp) {
  if (maxTemp >= 27) return tempImg[0];  // hot
  if (maxTemp >= 20) return tempImg[1];  // chill
  return tempImg[2];                     // cold
}

function pickRain(rain) {
  if (rain >= 5) return rainImg[2];      // heavy
  if (rain > 0)  return rainImg[1];      // light
  return rainImg[0];                     // dry
}

function drawData(data) {
  // look up the colour under the mouse in the saved pixels array
  var pg = temperatureMode ? tempBuf : rainBuf;
  var i = 4 * (floor(mouseY) * pg.width + floor(mouseX)); 
  // *4 since each pixel is 4 slots: r, g, b, a

  push();
  fill(pg.pixels[i], pg.pixels[i + 1], pg.pixels[i + 2]);
  rect(mouseX, mouseY, 100 + mouseX, 40 + mouseY);
  fill(0, 0, 100);
  textSize(12);
  if (temperatureMode) {
    text("Min: " + data.min + " °C", mouseX + 8, mouseY + 15);
    text("Max: " + data.max + " °C", mouseX + 8, mouseY + 30);
  } else {
    text("Rain: " + data.rain + " mm", mouseX + 8, mouseY + 15);
  }
  pop();
}

function displayText() {
  push();
  fill(170);
  textStyle(ITALIC);
  textSize(12);
  text('hover to check detail', 20, 640);
  text('press "m" to switch between temperature/rainfall modes', 20, 660);

  let detailsOffset = 0;

  if (showDetails) {
    textStyle(BOLD);
    text('Graphical Elements', 550, 650);
    textStyle(NORMAL);
    text('Image: colour of a pixel', 538, 665);
    text('Visualisation: temperature timeline', 479, 680);

    stroke('white');
    strokeWeight(1);
    line(525, 635, 662, 635);
    detailsOffset = 30;
  }

  noStroke();
  fill(200);
  textStyle(NORMAL);
  textSize(16);
  text('Interactive Media A1G', 506, 640 - detailsOffset);
  textStyle(ITALIC);
  textSize(10);
  text('press i for more information', 540, 655 - detailsOffset);
  pop();
}

function keyPressed() {
  if (key == 'i') {
    showDetails = !showDetails;
  }
  if (key == 'm') {
    temperatureMode = !temperatureMode;
  }
}