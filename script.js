// pixi.js test - copied from example 1 (rotating bunny)

/* TODO
- need to update linewrapping for pixi text
- switch movement to using translate instead of absolute positioning?
- change max-height to be height of...dragged rectangle?
- use min-height in css too?...should set size of div based on dragged
  rectangle size I guess
- better to use...sprites? instead of graphic?
- get working with multiple boxes!!
- get everything to scale :O :OOOOOOO (randomly? on scroll?)
- add drawing :D
- allow user to scroll to scale :O
- and arrows to translate :D or drag!!
- allow to input some markdown, render to HTML to display!
  use sprites for this? still not sure advantage...
- get cursor to be in proper place when clicking to edit
- add stuff for adding new rects, dragging, resizing, etc.!
- figure out how to add hidden(?) text so can be indexed - add inside
  canvas tag as fallback?
- seems like transform css doesn't work in chrome - need to use the chrome-
  specific ones?
- could use cacheAsBitmap when moving around 'background' (including windows?)
- see if newest version of html2canvas supports bullet points?
- why does html_sprite always seem to have padding on top?
*/


var WIDTH  = 400,
HEIGHT = 400;
var WEIRD_PADDING = 11;

// create a new instance of a pixi stage
var interactive = true;
var stage = new PIXI.Stage(0x66FF99, interactive);

// create a renderer instance
//var renderer = PIXI.autoDetectRenderer(WIDTH, HEIGHT);
//var renderer = new PIXI.WebGLRenderer(WIDTH, HEIGHT);
var renderer = new PIXI.CanvasRenderer(WIDTH, HEIGHT);

// add the renderer view element to the DOM
document.body.appendChild(renderer.view);

requestAnimFrame(animate);

// get the box to move around
var textbox = document.getElementById("textbox");
var rect_clicked = false; // UGLY HACK?
// set callback for when it loses focus
$(textbox).blur(restore_pixi_text);
// make other things lose focus on click
$(renderer.view).click(function(event) {
  if (!rect_clicked) {
    $(textbox).blur();
  }
  rect_clicked = false;
});

// add a rectangle
var rect_graphics = new PIXI.Graphics();
rect_graphics.beginFill(0x999999);
rect_graphics.drawRect(0, 0, 50, 30);
stage.addChild(rect_graphics);

// add click callback
rect_graphics.setInteractive(true);
rect_graphics.click = insert_div_text;

// rectangle's velocities...ugly to have global
// will need to make into an object / 'class'
rect_x = 10;
rect_y = 10;
rect_w = 70;
rect_h = 70;
rect_vel_x = -1;
rect_vel_y = -2;

// test dom rendering stuff
var empty_canvas = document.createElement('canvas');
var test_tex = PIXI.Texture.fromCanvas(empty_canvas);
var html_sprite = new PIXI.Sprite(test_tex);
html_sprite.position.x = 100;
html_sprite.position.y = 100;
stage.addChild(html_sprite);

// start with rendered text on div - think only works with canvas
restore_pixi_text();


function animate() {
  requestAnimFrame(animate);

  // bounce canvas rectangle
  bounce(); // will have to change this to bounce multiple rects.. 
  rect_x += rect_vel_x;
  rect_y += rect_vel_y;
  rect_graphics.clear()

  // update graphics
  rect_graphics.beginFill(0x999999);
  // how to do without redrawing everything? 
  rect_graphics.drawRect(rect_x, rect_y, rect_w, rect_h);
  // uhhh
  rect_graphics.hitArea = new PIXI.Rectangle(rect_x, rect_y, rect_w, rect_h);

  // move textbox to match rectangle
  textbox.style.top  = rect_y + 'px';
  textbox.style.left = rect_x + 'px';
  //textbox.style.transform = 'scale(.25)';

  // resize rectangle to match textbox
  rect_w = textbox.offsetWidth;
  rect_h = textbox.offsetHeight;

  // move html sprite to match
  html_sprite.position.x = rect_x;
  html_sprite.position.y = rect_y - WEIRD_PADDING; // why why why why why why 

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

function insert_div_text(mouseData) {
  // make div appear and make focused
  $(textbox).css('visibility', 'visible');
  $(textbox).focus();
  // update textbox_showing
  rect_clicked = true;
  // remove pixi text
  html_sprite.setTexture(PIXI.Texture.fromCanvas(empty_canvas)); 
}

function restore_pixi_text(mouseData) {
  // replace pixi text
  render_textbox($(textbox).val(), rect_w, rect_h);
  // hide div
  $(textbox).css('visibility', 'hidden');
}

function render_textbox(text, width, height) {
  // dangerous??? couldn't someone just pass in arbitrary HTML?
  // get html from markdown
  var markdown_html = markdown.toHTML(text);

  // make style sheet?
  var render_style = "<style>body{"+
    "margin: 0px;"+
    "border: 0px solid;"+
    "padding: 0px;"+
    "font-size: 12px;"+
    "font-family: 'Courier New';"+
    "width:"+width+"px;"+
    "height:"+(height+WEIRD_PADDING)+"px;"+
    "overflow: hidden;"+
    "}</style>";

  // combine stylesheet and html
  markdown_html = render_style + markdown_html;
  
  // render and update sprite
  rasterizeHTML.drawHTML(markdown_html)
    .then(function success(renderResult) {
      html_sprite.setTexture(PIXI.Texture.fromCanvas(renderResult.image)); 
    }, function error(e) {
      console.log('rendering error!');
      console.log(e);
    });
}
