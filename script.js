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
*/


var WIDTH  = 400,
    HEIGHT = 400;
// stupid indentation...

// create a new instance of a pixi stage
var interactive = true;
var stage = new PIXI.Stage(0x66FF99, interactive);

// create a renderer instance
var renderer = PIXI.autoDetectRenderer(WIDTH, HEIGHT);

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
rect_w = 50;
rect_h = 30;
rect_vel_x = -1;
rect_vel_y = -2;

// and text
var style =  {font: "14px Courier New", wordWrap: true};
var text = new PIXI.Text("pixi text!\nline breaks   r gud\nyes", style);
stage.addChild(text);

// start with pixi text on div
restore_pixi_text();

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
  // uhhh
  rect_graphics.hitArea = new PIXI.Rectangle(rect_x, rect_y, rect_w, rect_h);

  // move textbox to match rectangle
  textbox.style.top  = rect_y + 'px';
  textbox.style.left = rect_x + 'px';
  //textbox.style.transform = 'scale(.25)';

  // resize rectangle to match textbox
  rect_w = textbox.offsetWidth;
  rect_h = textbox.offsetHeight;

  // move text to match
  text.x = rect_x;
  text.y = rect_y;
  //text.width
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
  // also need to do nonbreaking spaces?
  // data.replace(/ /g, '\u00a0');??
  // or just do white-space: pre-wrap; in css
  return text.replace(/\n/g,"<br />");
}

function html_to_text(html) {
  // convert <br> tags to newlines
  return html.replace(/\<br[\/]*\>/g, '\n').replace(/&nbsp;/g, ' ');
}

function insert_div_text(mouseData) {
  // make div appear and make focused
  //$(textbox).show();
  $(textbox).css('visibility', 'visible');
  $(textbox).html(text_to_html(text.text));
  $(textbox).focus();
  // update textbox_showing
  rect_clicked = true;
  // remove pixi text
  text.setText('');
}

function restore_pixi_text(mouseData) {
  // replace pixi text
  text.setText(html_to_text($(textbox).html()));
  // hide div
  $(textbox).css('visibility', 'hidden');
  //$(textbox).hide();
}

