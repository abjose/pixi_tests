// pixi.js test - copied from example 1 (rotating bunny)

/* TODO
- MAKE THINGS CLASSY
- and drag to translate :D!
- samer wants physics
- allow adding new rects!
- and scaling!
- and...drawing?!
- probably doesn't make sense to use overflow: hidden for everything - 
  maybe once larger than a certain size should break? Or...never break?
- switch movement to using translate instead of absolute positioning?
- get everything to scale :O :OOOOOOO (randomly? on scroll?)
- get cursor to be in proper place when clicking to edit
- figure out how to add hidden(?) text so can be indexed - add inside
  canvas tag as fallback?
- seems like transform css doesn't work in chrome - need to use the chrome-
  specific ones?
- could use cacheAsBitmap when moving around 'background' (including windows?)
- why does html_sprite always seem to have padding on top?
- rasterizeHTML's ZOOM option seems like it might be useful!
- make more 'reactive' - only animate when necessary?
  http://www.html5gamedevs.com/topic/2866-call-renderer-only-when-needed/
- consider changing again - canvas when not touching, to div when moused over
  (or clicked/tapped once?) to textarea when clicked (or clicked/tapped twice).
  This way easy to scroll through / follow links without reverting to plain-text
- can just use iframe instead of div? or...could use iframe for displaying
  other websites?
*/


var WIDTH  = window.innerWidth,
HEIGHT = window.innerHeight;
var WEIRD_PADDING = 10;

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
rect_graphics.interactive = true;
rect_graphics.buttonMode = true;
stage.addChild(rect_graphics);

// add click callback
var mouse_x = 0,
mouse_y = 0;
rect_graphics.setInteractive(true);
rect_graphics.click = insert_textbox;
rect_graphics.mousedown = function(mouseData) {
  dragging = true;
};
rect_graphics.mousemove = function(mouseData) {
  mouse_x = mouseData.global.x;
  mouse_y = mouseData.global.y;
};
rect_graphics.mouseup   = function(mouseData) {
  dragging = false;
};

// rectangle's velocities...ugly to have global
// will need to make into an object / 'class'
var rect_x = 10;
var rect_y = 10;
var rect_w = 70;
var rect_h = 70;
var rect_vel_x = -1;
var rect_vel_y = -2;

// dragging stuff
var dragging = false;

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
  //bounce(); // will have to change this to bounce multiple rects..
  if (dragging) {
    rect_x = mouse_x;
    rect_y = mouse_y;
  }
  
  // update graphics
  rect_graphics.clear()
  rect_graphics.beginFill(0x999999);
  // how to do without redrawing everything? 
  rect_graphics.drawRect(rect_x, rect_y, rect_w, rect_h);
  rect_graphics.hitArea = new PIXI.Rectangle(rect_x, rect_y, rect_w, rect_h);

  // resize rectangle to match textbox
  rect_w = textbox.offsetWidth;
  rect_h = textbox.offsetHeight;

  // move html sprite to match
  html_sprite.position.x = rect_x;
  html_sprite.position.y = rect_y - WEIRD_PADDING; // why why why why why why 
  //html_sprite.scale.x = 25;
  
  // render the stage
  renderer.render(stage);
}

function insert_textbox(mouseData) {
  // position appropriately
  textbox.style.top  = rect_y + 'px';
  textbox.style.left = rect_x + 'px';
  //textbox.style.transform = 'scale(.25)';
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
  rasterizeHTML.drawHTML(markdown_html, {zoom: 1})
    .then(function success(renderResult) {
      html_sprite.setTexture(PIXI.Texture.fromCanvas(renderResult.image)); 
    }, function error(e) {
      console.log('rendering error!');
      console.log(e);
    });
}
