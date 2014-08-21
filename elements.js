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
  var ids = this.quadtree.query(view_rect), i = 0;

  // tell everything you previously saw to clear itself
  for (i=0; i < this.prev_ids.length; i++)
    this.quadtree.obj_ids[this.prev_ids[i]].clear();
  // then update prev_ids
  this.prev_ids = ids;
  
  // tell everything to render itself
  for (var i=0; i < ids.length; i++)
    this.quadtree.obj_ids[ids[i]].render(view_rect, render_rect);
  // sure you don't want to pass different rects?
  // hmm, should be..same?

  // use rect to draw self

  // should have extra 'is_main_view' thing? that would keep from
  // querying stuff underneath and skip drawing self and...other stuff
  // can tell using rects?

  // so ViewRect has rect and input_rect
  // then gets view_rect and render_rect
  // what does each mean?
  // rect is location of viewrect 'output' on *surface*
  // input_rect is location of viewrect 'input' on *surface*
  // view_rect is location of current view
  // render_rect is area to render to on canvas
};

// 'transform' passed rect from a to b
function transform_rect(rect, a, b) {
  return {x: ((rect.x - a.x) / a.w) * b.w,
	  y: ((rect.y - a.y) / a.h) * b.h,
	  w: rect.w * (b.w / a.w),
	  h: rect.h * (b.h / a.h) };
}

// convert canvas coords to surface coords
// consider making this an option for transform_rect or something
function canvas_to_surface(rect, render_rect, view_rect) {
  var r = transform_rect(rect, render_rect, view_rect);
  r.x += view_rect.x; r.y += view_rect.y;
  return r;
}
