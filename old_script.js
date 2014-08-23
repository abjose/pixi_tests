// pixi.js test - copied from example 1 (rotating bunny)

/* TODO
- add drag to translate! and inertial dragging?
- allow adding new rects!
- and...drawing?!
- probably doesn't make sense to use overflow: hidden for everything - 
  maybe once larger than a certain size should break? Or...never break?
- switch movement to using translate instead of absolute positioning?
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
- consider using multiple stacked canvases 
- put global functions (that aren't 'classes') into a utilities file?
  and put them in a 'tools' namespace or something
- allow zooming in to where mouse is?
- make sure things are converted to integer coordinates? looks ugly otherwise
- things get weird when zoomed in too far
- shouldn't render bits of things that are partially off the view...
- need to handle z-related stuff - like drawing all rects on top of everything?
- should change name of render_rect to something like canvas_rect
- should have clicks be sent as events to rectangles? like if click on viewrect
  should pass to that viewrect, and then if a viewrect inside was clicked,
  should pass through...
  so add a handle_click thing to everything?
  yeah, should take a click location
- ALSO MAKE SURE TO MAKE SMALL CHANGES
- kinda cool to do something like a typical maps app - where when you 
  zoom out, things are 'summarized' in a sense, like instead of text you 
  see a larger text 'name' for a document or area...ehh.
*/

/* mini-todo
- make small changes - like adding proper offsets to transformation function
  cleaning stuff up, commenting a bit
- move this stuff into new file? like tests...just so don't have to deal
  with all this old code, then integrate later
- add handle_click functions to things and pass clicks a long
  goal: be able to click on smaller view and see rect appear in right place
  on other view too
*/

//var WIDTH  = window.innerWidth,
//    HEIGHT = window.innerHeight;
var WIDTH  = 500;
    HEIGHT = 500;
var WEIRD_PADDING = 10;

// create a new instance of a pixi stage
var interactive = true;
//var stage = new PIXI.Stage(0x66FF99, interactive);
var stage = new PIXI.Stage(0xFFFFFF, interactive);
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

var vr = new ViewRect({//x:  0, y:  0, w:  0, h:  0,
		       x:  0, y:  0, w:  WIDTH, h:  HEIGHT,
		       vx: 0, vy: 0, vw: WIDTH, vh: HEIGHT,
		       quadtree: qt, ctx: stage});

var vr2 = new ViewRect({x: 0, y: 0, w: 50, h: 50,
                        //x: 0, y: 0, w: WIDTH, h: HEIGHT,
                        //vx: 0, vy: 0, vw: WIDTH, vh: HEIGHT,
                        vx: 0, vy: 50, vw: 50, vh: 50,
			quadtree: qt, ctx: stage});
//vr2.color = 0x000000;

qt.insert(vr);
qt.insert(vr2);

// main view
var mv = vr;

var render_rect = {x:0, y:0, w:WIDTH, h:HEIGHT};

var trans_prop = 0.01;
window.addEventListener('keydown', function(event) {
  event.preventDefault();
  requestAnimFrame(animate);
  switch (event.keyCode) {
  case 37: mv.view.x -= mv.view.w*trans_prop; break; // left
  case 38: mv.view.y -= mv.view.h*trans_prop; break; // up
  case 39: mv.view.x += mv.view.w*trans_prop; break; // right
  case 40: mv.view.y += mv.view.h*trans_prop; break; // down
  }
}, false);

// TODO: so should move scale and translate stuff to objects themselves

var scale = 1.25;
var zoomr = null;
// if change to canvas-only event, can use mouse coordinates?
window.addEventListener('wheel', function(event) {
  event.preventDefault();
  requestAnimFrame(animate);
  //switch (event.wheelDelta > 0) {
  switch (event.deltaY > 0) {
  case false: // shrink (zoom in)
    zoomr = scale_view(mv.view, scale);
    break; 
  case true:  // grow (zoom out)
    zoomr = scale_view(mv.view, 1/scale);
    break; 
  }
  mv.view.x = zoomr.x; mv.view.y = zoomr.y;
  mv.view.w = zoomr.w; mv.view.h = zoomr.h;
}, false);

// remove this or put somewhere else
function scale_view(view, scale) {
  var new_w = view.w * scale;  var new_h = view.h * scale;
  var new_x = view.x - (new_w-view.w)/2;
  var new_y = view.y - (new_h-view.h)/2;
  return {x: new_x, y: new_y, w: new_w, h: new_h};
};

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

  //console.log(render_rect);
  vr.clear();
  vr.render(mv.view, render_rect, {}, true);

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
  qt_rect.x = -mv.view.x; qt_rect.y = -mv.view.y;
  qt.root.draw(qt_rect);
}

// insert a random-sized rectangle wherever we clicked
function insert_rectangle(mouseData) {
  requestAnimFrame(animate);

  // get 'out' rect coords
  var out = transform_rect(mv, mv.view, render_rect);

  // get surface coords
  var surf = transform_rect({x:mouseData.global.x, y:mouseData.global.y},
			    out, mv.view);
  surf.w = 5; surf.h = 5;
  surf.ctx = stage;
  
  var rect = new Rect(surf);
  // insert into quadtree
  qt.insert(rect);
}

// when mouse over part of quadtree, highlight those things
function highlight_rects() {
  // should recolor all default color, then color highlighted ones different?
  // instead of redrawing everything all the time
  var all = qt.query(null, null);
  var mouse = stage.getMousePosition();
  var r = transform_rect({x:mouse.x, y:mouse.y, w:1, h:1},
			 render_rect, mv.view);
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
