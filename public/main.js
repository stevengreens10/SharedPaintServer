var socket;
var notification = false;
var col;
var r = 30;
var canvas;
var hInput, sInput, bInput;
var colButton;
var haxInterval;

function setup(){
  canvas = createCanvas(1349,638);
  canvas.parent(select("#paint"));
  canvas.attribute('oncontextmenu', 'return false;');
  background(51);
  colorMode(HSB);
  col = color(random(360),random(50,100),100);
  socket = io.connect("http://138.197.15.195:3001");
  // socket = io.connect("localhost:3001");
  noStroke();

  socket.on('load', function(history){
    for(var i = 0; i < history.length; i++){
      var data = history[i];
      colorMode(HSB);
      fill(data.h,data.s,data.b);
      ellipse(data.x,data.y,data.r,data.r);
    }
  });

  socket.on('mouse', function(data){
    colorMode(HSB);
    fill(data.h,data.s,data.b);
    ellipse(data.x,data.y,data.r,data.r);

    if(!document.hasFocus()){
      notification = true;
      document.title = "(New) Paint";
    }
  });

  socket.on('reset', reset);

  createP("");
  hInput = createInput("");
  hInput.elt.placeholder = "Hue";
  sInput = createInput("");
  sInput.elt.placeholder = "Saturation";
  bInput = createInput("");
  bInput.elt.placeholder = "Brightness";
  colButton = createButton("Change Color");
  colButton.mousePressed(function(){
    var h = hInput.value();
    var s = sInput.value()/1;
    var b = bInput.value()/1;

    if(h == "") h = random(360);
    if(s == "") s = 100;
    if(b == "") b = 100;

    if(h != 'rainbow'){
      clearInterval(haxInterval);
      colorMode(HSB);
      col = color(h/1,s,b);
    }else{
      var c = 0;
      if(haxInterval) clearInterval(haxInterval);
      haxInterval = setInterval(function(){
        colorMode(HSB);
        var s1 = s;
        var b1 = b;
      col = color(c,s1,b1);
  	c++;
  	if(c >= 360) c = 0;
  }, 1);
      }
  });

}

function reset(){
  colorMode(RGB);
  background(51);
}

function draw(){
  if(document.hasFocus() && notification){
    document.title = "Paint";
    notification = false;
  }
}

function mouseDragged(){
  var h,s,b;
  if(mouseButton == 'left' && !keyIsDown(16)){
    h = hue(col);
    s = saturation(col);
    b = brightness(col);
  }else{
    h = 0;
    s = 0;
    b = 20;
  }

  var mouseData = {
    x: mouseX,
    y: mouseY,
    h: h,
    s: s,
    b: b,
    r: r
  }
  socket.emit('mouse', mouseData);

  colorMode(HSB);
  fill(h,s,b);
  ellipse(mouseX,mouseY,r,r);

  return false;
}

function keyPressed(){
  if(key == 'R' && mouseY < height){
    socket.emit('reset', undefined);
  }else if(keyCode == UP_ARROW){
    if(r <= 65) r+=5;
    return false;
  }else if(keyCode == DOWN_ARROW){
    if(r >=20){
      r-=5;
    }
    return false;
  }else if(keyCode == LEFT_ARROW){
    r = 15;
    return false;
  }else if(keyCode == RIGHT_ARROW){
    r = 70;
    return false;
  }else if(key == 'S'){
    save(Date() + ".jpg");
  }
}
