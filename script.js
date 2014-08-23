// pixi.js test - copied from example 1 (rotating bunny)

/* TODO
- add drag to translate! and inertial dragging?
- allow adding new rects!
- and...drawing?!
- make only redraw stuff when necessary
- allow key event detection in multiple directions at once
- add stuff to allow deletion!!!!
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
*/

/* mini-todo
- move scale and translate code into objects themselves
- move insert_rectangle into viewrect?
- add insert_viewrect into viewrect????
- add handle_click functions to things and pass clicks a long
  goal: be able to click on smaller view and see rect appear in right place
  on other view too
  good reason not to use built-in event stuff?
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

// render rect
var canvas_rect = {x:0, y:0, w:WIDTH, h:HEIGHT};

// viewrects
var vr = new ViewRect({//x:  0, y:  0, w:  0, h:  0,
		       x:  0, y:  0, w:  WIDTH, h:  HEIGHT,
		       vx: 0, vy: 0, vw: WIDTH, vh: HEIGHT,
		       quadtree: qt, ctx: stage});

var vr2 = new ViewRect({x: 0, y: 0, w: 50, h: 50,
                        //x: 0, y: 0, w: WIDTH, h: HEIGHT,
                        //vx: 0, vy: 0, vw: WIDTH, vh: HEIGHT,
                        vx: 0, vy: 50, vw: 50, vh: 50,
			quadtree: qt, ctx: stage});
qt.insert(vr);
qt.insert(vr2);

// main view
var mv = vr;

// temporary input handling
window.addEventListener('keydown', function(event) {
  event.preventDefault();
  requestAnimFrame(animate);
  switch (event.keyCode) {
  case 37: mv.translate(-1,  0); break; // left
  case 38: mv.translate( 0, -1); break; // up
  case 39: mv.translate( 1,  0); break; // right
  case 40: mv.translate( 0,  1); break; // down
  }
}, false);

// if change to canvas-only event, can use mouse coordinates?
window.addEventListener('wheel', function(event) {
  event.preventDefault();
  requestAnimFrame(animate);
  //switch (event.wheelDelta > 0) {
  switch (event.deltaY > 0) {
  case false: mv.scale(scale_prop);   break; 
  case true:  mv.scale(1/scale_prop); break; 
  }
}, false);

requestAnimFrame(animate);
function animate() {
  //requestAnimFrame(animate);

  vr.clear();
  vr.render(mv.view, canvas_rect, {}, true);
  
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
  var out = transform_rect(mv, mv.view, canvas_rect);

  // get surface coords
  var surf = transform_rect({x:mouseData.global.x, y:mouseData.global.y},
			    out, mv.view);
  surf.w = 5; surf.h = 5;
  surf.ctx = stage;
  
  var rect = new Rect(surf);
  // insert into quadtree
  qt.insert(rect);
}
