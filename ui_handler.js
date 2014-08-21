/* Track UI state and handle events and stuff. */

// http://nokarma.org/2011/02/27/javascript-game-development-keyboard-input/
var UIHandler = {
  // for now: track dragging and arrow keys

  // track keypresses
  pressed: {},

  // and mouse dragging
  clicked: {},
  
  // and some keys worth naming
  LEFT:  37,
  UP:    38,
  RIGHT: 39,
  DOWN:  40,

  isDown:    function(keyCode) { return this.pressed[keyCode]; },
  onKeyDown: function(event)   { this.pressed[event.keyCode] = true; },
  onKeyUp:   function(event)   { delete this.pressed[event.keyCode]; },
  // hmm, not sure this is the best way to do dragging and stuff..
  // for now just control with arrowkeys
  onMouseDown: function(event) { this.clicked = true; },
  onMouseUp:   function(event) { this.clicked = false; }
};

// uhh, should switch to jquery? not sure all browsers fire these events

// detect keystrokes
window.addEventListener('keyup',
			function(event) { UIHandler.onKeyUp(event); }, false);
window.addEventListener('keydown',
			function(event) { UIHandler.onKeyDown(event); }, false);

// detect mouse clicks (remember also have click and dblclick if want)
window.addEventListener('mouseup', 
			function(event) { UIHandler.onMouseDown(event);},false);
window.addEventListener('mousedown', 
			function(event) { UIHandler.onMouseUp(event); }, false);

// detect mouse scrolls
//window.addEventListener('mousewheel', function() {console.log('scroll!')});
