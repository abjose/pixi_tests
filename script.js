// pixi.js test - copied from example 1 (rotating bunny)

/* TODO
- and drag to translate! and inertial dragging?
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
- make only redraw stuff when necessary
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
- allow key event detection in multiple directions at once
- add stuff to allow deletion!!!!
- should definitely have a way of rendering everything to a big thing
  and moving that around instead of moving everything around separately...
- how to avoid having to use canvas to render HTML stuff? Sure you want to do
  rendering stuff at all? why not just use DOM stuff everywhere, plus an 
  underlying canvas layer for...drawing?
- do you even need to use pixi.js?
- kinda interesting to render all stuff onto a spritesheet...
- can remove matrix library
- consider using multiple stacked canvases 
- put global functions (that aren't 'classes') into a utilities file?
  and put them in a 'tools' namespace or something
*/

/*
- CONVERT THIS TO USE OBJECTS from elements.js
*/


//var WIDTH  = window.innerWidth,
//    HEIGHT = window.innerHeight;
var WIDTH  = 500;
    HEIGHT = 500;
var WEIRD_PADDING = 10;

// create a new instance of a pixi stage
var interactive = true;
var stage = new PIXI.Stage(0x66FF99, interactive);
// add temporary click callback
stage.click = insert_rectangle;

// create a renderer instance
//var renderer = PIXI.autoDetectRenderer(WIDTH, HEIGHT);
//var renderer = new PIXI.WebGLRenderer(WIDTH, HEIGHT);
var renderer = new PIXI.CanvasRenderer(WIDTH, HEIGHT);

// add the renderer view element to the DOM
document.body.appendChild(renderer.view);

// quadtree stuff
var qt = new Quadtree({x:150, y:320, w:100, h:100});
var qt_rect = new PIXI.Graphics();
stage.addChild(qt_rect);


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
//stage.addChild(rect_graphics);

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

var vr = new ViewRect({x:  0, y:  0, w:  WIDTH, h:  HEIGHT,
		       ix: 0, iy: 0, iw: WIDTH, ih: HEIGHT,
		       quadtree:qt, ctx: stage});

// uhh, combine with above?
// change so can have a 'main view' and use that view's stuff for these
var view_rect   = {x:0, y:0, w:WIDTH, h:HEIGHT};
var render_rect = {x:0, y:0, w:WIDTH, h:HEIGHT};

window.addEventListener('mousemove', function(event) {
  //requestAnimFrame(animate);
}, false);

window.addEventListener('keydown', function(event) {
  event.preventDefault();
  requestAnimFrame(animate);
  switch (event.keyCode) {
  case 37: view_rect.x -= 5; break; // left
  case 38: view_rect.y -= 5; break; // up
  case 39: view_rect.x += 5; break; // right
  case 40: view_rect.y += 5; break; // down
  }
}, false);

// MAKE TRANSLATION DEPEND ON SCALE??
// just translate by some proportion of the view's size

// SOMETHING WEIRD HAPPENING WITH SCALE
// sometimes zooms on a different location?
// might be bug with scale_view setting x and y

// zooming isn't quite right
var scale = 1.25;
var zoomr = null;
window.addEventListener('mousewheel', function(event) {
  event.preventDefault();
  requestAnimFrame(animate);
  // uhh
  switch (event.wheelDelta > 0) {
  case false: // shrink (zoom in)
    zoomr = scale_view(view_rect, scale);
    break; 
  case true:  // grow (zoom out)
    zoomr = scale_view(view_rect, 1/scale);
    break; 
  }
  view_rect.x = zoomr.x; view_rect.y = zoomr.y;
  view_rect.w = zoomr.w; view_rect.h = zoomr.h;
  console.log(view_rect);
}, false);

// remove this or put somewhere else
function scale_view(view, scale) {
  var new_w = view.w * scale;  var new_h = view.h * scale;
  var new_x = view.x - (new_w-view.w)/2;
  var new_y = view.x - (new_h-view.h)/2;
  return {x: new_x, y: new_y, w: new_w, h: new_h};
};

// need to have quadtree affected by view...
// does that mean...putting qt inside qt??


requestAnimFrame(animate);
function animate() {
  //requestAnimFrame(animate);
  
  // bounce canvas rectangle
  //bounce(); // will have to change this to bounce multiple rects..
  if (dragging) {
    rect_x = mouse_x;
    rect_y = mouse_y;
  }

  // draw the quadtree
  //draw_qt();
  //highlight_rects();
  
  vr.render(view_rect, render_rect);

  /*
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
  remember to uncomment stage.add stuff for rectangle
  */

  // render the stage
  renderer.render(stage);
};

// draw the bounds of the quadtree
function draw_qt() {
  // just need to draw a rectangle for every child, top-down
  // hmm, easier to just add a small drawing function to QNode? ehhh.
  qt_rect.clear();
  qt_rect.x = -view_rect.x; qt_rect.y = -view_rect.y;
  qt.root.draw(qt_rect);
}

// insert a random-sized rectangle wherever we clicked
function insert_rectangle(mouseData) {
  requestAnimFrame(animate);
  var max_w = 5, max_h = 5;
  var r = canvas_to_surface({x:mouseData.global.x, y:mouseData.global.y,
			     //w:Math.random()*max_w, h:Math.random()*max_h,
			     w:max_w, h:max_h}, render_rect, view_rect);
  r.w = max_w; r.h = max_h;
  r.ctx = stage;
  var rect = new Rect(r);

  // insert into quadtree
  qt.insert(rect);
}

// when mouse over part of quadtree, highlight those things
function highlight_rects() {
  // should recolor all default color, then color highlighted ones different?
  // instead of redrawing everything all the time
  var all = qt.query(null, null);
  var mouse = stage.getMousePosition();
  var r = canvas_to_surface({x:mouse.x, y:mouse.y, w:1, h:1},
			    render_rect, view_rect);
  var ids = qt.query(r, null, true);

  // COULD ADD A 'DIRTY' PARAMETER TO OBJECTS FOR RERENDERING?
  // just go through and change their color property
  for (var i=0; i < all.length; i++) {
    var obj = qt.obj_ids[all[i]];
    obj.color = 0x0077AA;
  }
  for (var i=0; i < ids.length; i++) {
    var obj = qt.obj_ids[ids[i]];
    obj.color = 0xFF0000;
  }
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
