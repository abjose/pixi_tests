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
- cool if in rendered thing stored reference to rendered version so can just
  'copy-paste' it there instead of having to re-render?
*/

var size_thresh = 3;
var render_limit = 1; // number of times to render anys ViewRects

function Rect(args) {
  // rectangle id and bounds on the whiteboard
  this.x = args.x; this.y = args.y;
  this.w = args.w; this.h = args.h;
  this.id = UUID();
  
  // list of surfaces this rectangle is visible on
  this.surfaces = {};

  // graphics...
  this.color = 0x0077EE;
  this.rect  = new PIXI.Graphics();
  args.ctx.addChild(this.rect);
}

Rect.prototype.render = function(view_rect, render_rect) {
  // view_rect is the region on the surface being rendered
  // render_rect is the region on the context to render to
  
  // figure out equivalent rect in render_rect frame
  var t = transform_rect(this, view_rect, render_rect);
  t.x += render_rect.x; t.y += render_rect.y;

  // then draw it
  //this.rect.clear(); // TODO: don't think you need to clear here...
  this.rect.beginFill(this.color);
  // TODO: make transform_rect do addition to translate by default!!
  this.rect.drawRect(t.x, t.y, t.w, t.h);
};

Rect.prototype.clear = function() {
  this.rect.clear();
}

function ViewRect(args) {
  Rect.call(this, args);

  // have 'ouput' bounds (where ViewRect appears on surface),
  // now need 'input' bounds (what the ViewRect views on the surface)
  this.view = {x: args.vx, y:args.vy, w:args.vw, h:args.vh};

  // quadtree to query
  this.quadtree = args.quadtree;

  // previously-seen stuff
  this.prev_ids = [];

  // be same color as background
  this.color = 0x66FF99;
}
ViewRect.prototype = Object.create(Rect.prototype);
ViewRect.prototype.constructor = ViewRect;

ViewRect.prototype.clear = function(cleared) {
  // probably...shouldn't do this every time...
  cleared = cleared || {};
  cleared[this.id] = cleared[this.id]+1 || 1;
  if (cleared[this.id] > 1) return;
  
  this.rect.clear();
  
  // tell everything you previously saw to clear itself
  for (var i = 0; i < this.prev_ids.length; i++)
    if (this.prev_ids[i] !== this.id)
      this.quadtree.obj_ids[this.prev_ids[i]].clear(cleared);
};

// render onto rectangle rect of  context ctx unless w or h are <= thresh
ViewRect.prototype.render = function(view_rect, render_rect,
				     rendered, main_view) { 
  // object to keep track of what's been rendered
  rendered = rendered || {};
  rendered[this.id] = rendered[this.id]+1 || 1;
  if (rendered[this.id] > render_limit) return;
  if (render_rect.w <= size_thresh || render_rect.h <= size_thresh)
    return;

  main_view = main_view || false;
  
  // figure out equivalent rect in render_rect frame
  var t = transform_rect(this, view_rect, render_rect);
  t.x += render_rect.x; t.y += render_rect.y;

  if (t.w <= size_thresh || t.h <= size_thresh)
    return;

  if (main_view) {
    this.x = this.view.x; this.y = this.view.y;
    this.w = this.view.w; this.h = this.view.h;
    //this.x = view_rect.x; this.y = view_rect.y;
    //this.w = view_rect.w; this.h = view_rect.h;
  }
  
  // draw self
  //this.rect.clear();
  this.rect.lineStyle(1, 0x000000);
  this.rect.beginFill(this.color);
  this.rect.drawRect(t.x, t.y, t.w, t.h);

  
  // query the surface for stuff to draw - nothing fancy for now
  //var ids = this.quadtree.query(view_rect), i = 0;
  var ids = this.quadtree.query(this.view), i = 0;
  this.prev_ids = ids;
  
  // tell everything to render itself
  for (var i=0; i < ids.length; i++) {
    // make sure don't render self - IDEALLY DON'T HAVE TO DO THIS?
    if (ids[i] !== this.id) {
      this.quadtree.obj_ids[ids[i]].render(this.view, t, rendered);
    }
  }
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
