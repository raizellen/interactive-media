class Tile {
  constructor(data, spacer) {
    this.data = data;
    this.x = 105 + (spacer % 7) * 70;
    this.y = 170 + floor(spacer / 7) * 70;
    this.size = 70;
    this.tempImg = pickTemp(data.max);
    this.rainImg = pickRain(data.rain);
  }

  // pg: target buffer, useTemp: true = temperature image, false = rain image
  drawTile(pg, useTemp) {
    var img = useTemp ? this.tempImg : this.rainImg;
    pg.image(img, this.x + 2, this.y + 2, 
             this.size - 4, this.size - 4); // add some gap

    pg.push();
    pg.stroke(1);
    pg.fill(255);
    pg.textSize(11);
    pg.text(this.data.day, this.x + this.size/2 - 4, this.y + 14);
    pg.pop();
  }

  isHovered() {
    var cx = this.x + this.size / 2;
    var cy = this.y + this.size / 2;
    return dist(mouseX, mouseY, cx, cy) < this.size/2 - 2;
  }
}