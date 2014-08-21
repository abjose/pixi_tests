/* Various elements that can go on the white board. */

/* NOTES
- consider using transforms
- consider returning canvases rather than passing along contexts
- do more filtering when querying what to render - filter things
  that are too small or not on correct surface
- need something to handle z-fighting
- inheritance / traversing prototype chain is slow?
- consider adding some minimal-size thresh to view_rect so doesn't keep
  drawing smaller and smaller view_rects
- write function to convert from click (render_rect) to view_rect
  could take out the stuff in Rect.render right now and put in own functions
  so have go one way and then the other
*/

function Rect(args) {
  // rectangle id and bounds on the whiteboard
  this.x = args.x; this.y = args.y;
  this.w = args.w; this.h = args.h;
  this.id = UUID();
  
  // list of surfaces this rectangle is visible on
  this.surfaces = {};

  // graphics...
  this.rect = new PIXI.Graphics();
  args.ctx.addChild(this.rect);
}

Rect.prototype.render = function(view_rect, render_rect) {
  // ctx is the context to draw to -- actually stage?
  // view_rect is the region on the surface being rendered
  // render_rect is the region on the context to render to
  
  // figure out equivalent rect in render_rect frame
  var new_x = ((this.x - view_rect.x) / view_rect.w) * render_rect.w;
  var new_y = ((this.y - view_rect.y) / view_rect.h) * render_rect.h;
  var new_w = this.w * (render_rect.w / view_rect.w);
  var new_h = this.h * (render_rect.h / view_rect.h);

  //console.log(new_x, new_y, new_w, new_h);

  // then...draw it?
  this.rect.clear();
  this.rect.beginFill(0x0077AA);
  this.rect.drawRect(new_x, new_y, new_w, new_h);
};

function ViewRect(args) {
  //var vr = Object.create( new Rect(args) );
  Rect.call(this, args);

  // have 'frame' bounds, now need 'view' bounds (what the view rect views)
  this.vx = args.vx; this.vy = args.vy;
  this.vw = args.vw; this.vh = args.vh;

  // quadtree to query
  this.quadtree = args.quadtree;
}
ViewRect.prototype = Object.create(Rect.prototype);
ViewRect.prototype.constructor = ViewRect;

// render onto rectangle rect of  context ctx unless w or h are <= thresh
ViewRect.prototype.render = function(view_rect, render_rect) { // thresh
  // query the surface for stuff to draw - nothing fancy for now
  var ids = this.quadtree.query(view_rect);
  
  // tell everything to render itself
  for (var i=0; i < ids.length; i++) {
    this.quadtree.obj_ids[ids[i]].render(view_rect, render_rect);
  }
};
