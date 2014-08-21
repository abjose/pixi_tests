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
  this.color = 0x0077AA;
  this.rect  = new PIXI.Graphics();
  args.ctx.addChild(this.rect);
}

Rect.prototype.render = function(view_rect, render_rect) {
  // view_rect is the region on the surface being rendered
  // render_rect is the region on the context to render to
  
  // figure out equivalent rect in render_rect frame
  var t = transform_rect(this, view_rect, render_rect);

  // then draw it
  this.rect.clear();
  this.rect.beginFill(this.color);
  this.rect.drawRect(t.x, t.y, t.w, t.h);
};

Rect.prototype.clear = function() {
  this.rect.clear();
}

function ViewRect(args) {
  Rect.call(this, args);

  // have 'ouput' bounds (where ViewRect appears on surface),
  // now need 'input' bounds (what the ViewRect views on the surface)
  this.ix = args.ix; this.iy = args.iy;
  this.iw = args.iw; this.ih = args.ih;

  // quadtree to query
  this.quadtree = args.quadtree;

  // previously-seen stuff
  this.prev_ids = [];
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
