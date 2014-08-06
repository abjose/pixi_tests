// pixi.js test - copied from example 1 (rotating bunny)

/* TODO
- bouncing gets stuck if change size while bouncing into bottom part...
  maybe not worth fixing.
- FIX TEXT PROBLEMS
- get pixi.js text to copy what's in div
- get pixi.js to hide text when click on rect
- get pixi.js to re-show text when click outside of rect?
- get div to appear (in focus) when click rect
- get div to disappear it loses focus (or when click outside of rect)
- get working with multiple boxes!!
- get everything to scale :O :OOOOOOO (randomly? on scroll?)
- switch movement to using translate instead of absolute positioning?
- change max-height to be height of...dragged rectangle?
- use min-height in css too?...should set size of div based on dragged
  rectangle size I guess
- can just transform entire document? not really, scales down canvas...
*/


var WIDTH  = 400,
    HEIGHT = 400;
// stupid indentation...

// create a new instance of a pixi stage
var stage = new PIXI.Stage(0x66FF99);

// create a renderer instance
var renderer = PIXI.autoDetectRenderer(WIDTH, HEIGHT);

// add the renderer view element to the DOM
//document.body.appendChild(renderer.view);
document.getElementById("container").appendChild(renderer.view);

requestAnimFrame(animate);

// get the box to move around
var textbox = document.getElementById("textbox");
var container = document.getElementById("container");

// add a rectangle
var rect_graphics = new PIXI.Graphics();
rect_graphics.beginFill(0x999999);
rect_graphics.drawRect(0, 0, 50, 30);
stage.addChild(rect_graphics);

// rectangle's velocities...ugly to have global
// will need to make into an object / 'class'
rect_x = 10;
rect_y = 10;
rect_w = 50;
rect_h = 30;
rect_vel_x = -1;
rect_vel_y = -2;

// and text
var style =  {font: "14px Courier New", wordWrap: true};
var text = new PIXI.Text("pixi text!\nline break", style);
stage.addChild(text);

function animate() {
  requestAnimFrame(animate);

  // bounce canvas rectangle
  bounce(); // will have to change this to bounce multiple rects.. 
  rect_x += rect_vel_x;
  rect_y += rect_vel_y;
  rect_graphics.clear()
  rect_graphics.beginFill(0x999999);
  // how to do without redrawing everything? 
  rect_graphics.drawRect(rect_x, rect_y, rect_w, rect_h);

  // move textbox to match rectangle
  textbox.style.top  = rect_y + 'px';
  textbox.style.left = rect_x + 'px';
  //textbox.style.transform = 'scale('+((1+rect_y/HEIGHT)/4)+')';
  //textbox.style.transform = 'scale(.25)';

  // resize rectangle to match textbox
  rect_w = textbox.offsetWidth;
  rect_h = textbox.offsetHeight;

  // move text to match
  text.x = rect_x;
  //text.width
  //text.y = rect_y;
  //console.log(html_to_text($("#textbox").html()));
  text.setText(html_to_text($('#textbox').html()));
  //text.setText(textbox.innerHTML.text());
  //text.setText(textbox.textContent);
  //text.setText(textbox.innerText);
  //style.
  //text.setStyle({});

  // render the stage
  renderer.render(stage);
}

function bounce() {
  // bounce the rectangle on the canvas
  if (rect_x <= 0 || rect_x+rect_w >= WIDTH) {
    rect_vel_x *= -1;
  }
  if (rect_y <= 0 || rect_y+rect_h >= HEIGHT) {
    rect_vel_y *= -1;
  }
}

function text_to_html(text) {
  // convert newlines to <br> tags
  // hmm...also need to do nonbreaking spaces?
  return text.replace('\n', '<br></br>');
}

function html_to_text(html) {
  // convert <br> tags to newlines
  return html.replace(/\<br[\/]*\>/g, '\n').replace(/&nbsp;/g, ' ');
}
