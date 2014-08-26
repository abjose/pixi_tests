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
- For simple interface - have little button and pop up div?
- If adding dragging stuff, consider thinking about 'update' function for 
  quadtree!
- make highlighting better - better if keep track from UI manager?
*/

/* mini-todo
- move event handling stuff to UI handler!
  UI handler could track list of main view changes
  Can just be list, nothing fancy
  Last element is current main view 
  Also change name to 'ui manager'?
- allow deleting
  just remove highlighted thing by id!
- allow dragging
  alternately control with arrow keys
  maybe adding dragging to view would make this easier?
  add handle-drag fns?
  drag view if main view, otherwise drag rect
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
		       quadtree: qt, stage: stage});

var vr2 = new ViewRect({x: 0, y: 0, w: 50, h: 50,
                        //x: 0, y: 0, w: WIDTH, h: HEIGHT,
                        //vx: 0, vy: 0, vw: WIDTH, vh: HEIGHT,
                        vx: 0, vy: 50, vw: 50, vh: 50,
			quadtree: qt, stage: stage});
qt.insert(vr);
qt.insert(vr2);

// main view
var mv = vr;

// temporary input handling
window.addEventListener('keydown', function(event) {
  //event.preventDefault();
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
  //event.preventDefault();
  requestAnimFrame(animate);
  //switch (event.wheelDelta > 0) {
  switch (event.deltaY > 0) {
  case false: mv.scale(scale_prop);   break; 
  case true:  mv.scale(1/scale_prop); break; 
  }
}, false);
// add temporary click callback
stage.click = function(e) {
  //event.preventDefault();
  requestAnimFrame(animate);
  mv.handle_click({x:e.global.x, y:e.global.y}, mv.view, canvas_rect);
};

requestAnimFrame(animate);
function animate() {
  //requestAnimFrame(animate);

  vr.clear();
  vr.render(mv.view, canvas_rect, {}, true);
  
  // render the stage
  renderer.render(stage);
};
