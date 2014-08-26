/* Track UI state and handle events and stuff. */

/* TODO
- switch to jquery for better cross-browser support?
- UI handler could track list of main view changes
  Can just be list, nothing fancy
  Last element is current main view 
- lots of global obnoxiousness - canvas_rect, scale_prop...
- clean up functions definitions and bindings in constructor...
*/

function UIManager(mv) {
  // track main view - use list instead?
  this.mv = mv;
  
  // track keypresses
  this.pressed = {};

  // and mouse dragging
  this.clicked = {};
  
  // and some keys worth naming
  this.keys = {LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40};

  this.isDown  = function(keyCode) { return this.pressed[keyCode]; };
  this.onKeyDown = function(event) { this.handle_presses(event.keyCode); };
  this.onKeyUp   = function(event) { delete this.pressed[event.keyCode]; };
  // hmm, not sure this is the best way to do dragging and stuff..
  // for now just control with arrowkeys
  this.onMouseDown = function(event) { this.clicked=true;
				       this.handle_click(event); };
  this.onMouseUp   = function(event) { this.clicked=false; };
  // click stuff
  this.onClick = function(event) { this.handle_click(event); };

  // bind events
  // detect keystrokes
  var UI = this;
  window.addEventListener('keyup',
			  function(event) { UI.onKeyUp(event); }, false);
  window.addEventListener('keydown',
			  function(event) { UI.onKeyDown(event); }, false);
  
  // detect mouse clicks (remember also have click and dblclick if want)
  window.addEventListener('mouseup', 
			  function(event) { UI.onMouseDown(event);},false);
  window.addEventListener('mousedown', 
			  function(event) { UI.onMouseUp(event); }, false);
  // detect mouse scrolls
  window.addEventListener('wheel',
			  function(event) { UI.handle_wheel(event); }, false);  
};

UIManager.prototype.handle_presses = function(keyCode) {
  requestAnimFrame(animate);
  // note keypress
  this.pressed[event.keyCode] = true;
  // handle keypresses
  if (this.isDown(this.keys.LEFT))  this.mv.translate(-1,  0);
  if (this.isDown(this.keys.RIGHT)) this.mv.translate( 1,  0);
  if (this.isDown(this.keys.UP))    this.mv.translate( 0, -1);
  if (this.isDown(this.keys.DOWN))  this.mv.translate( 0,  1);
}

UIManager.prototype.handle_wheel = function(event) {
  requestAnimFrame(animate);
  switch (event.deltaY > 0) {
  case true:  this.mv.scale(scale_prop);   break; 
  case false: this.mv.scale(1/scale_prop); break; 
  }
};

UIManager.prototype.handle_click = function(event) {
  requestAnimFrame(animate);
  this.mv.handle_click({x:event.x, y:event.y}, this.mv.view, canvas_rect);
};
