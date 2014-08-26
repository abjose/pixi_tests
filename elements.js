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
var trans_prop = 0.015;
var scale_prop = 1.25;

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
  this.stage = args.stage;
  this.stage.addChild(this.rect);
}

Rect.prototype.render = function(view_rect, render_rect) {
  // view_rect is the region on the surface being rendered
  // render_rect is the region on the context to render to
  
  // figure out equivalent rect in render_rect frame
  var t = transform_rect(this, view_rect, render_rect);

  // then draw it
  this.rect.beginFill(this.color);
  this.rect.drawRect(t.x, t.y, t.w, t.h);
};

Rect.prototype.handle_click = function(click, view_rect, render_rect, objs) {
  // highlight self?
  this.highlight(true);
};

Rect.prototype.highlight = function(is_highlighted) {
  // highlight if is_highlighted is true, else un-highlight
  if (is_highlighted) {
    this.color = 0xFF0000;
  } else {
    this.color = 0x0077EE; 
  }
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

  // display stuff
  this.color = 0x66FF99;
  this.line_width = 1;
  this.line_color = 0x000000;

  // thing that's highlighted - probably want to use an object or something
  // or just do somewhere else entirely (like in UI manager)
  this.highlighted = null;  
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
// TODO: split this function up!
ViewRect.prototype.render = function(view_rect, render_rect,
				     rendered, main_view) {
  // object to keep track of what's been rendered
  rendered = rendered || {};
  rendered[this.id] = rendered[this.id]+1 || 1;
  // skip if rendered too many times
  if (rendered[this.id] > render_limit) return;

  // track if we're the main view (i.e. should set region = view)
  main_view = main_view || false;
  if (main_view) {
    this.x = this.view.x; this.y = this.view.y;
    this.w = this.view.w; this.h = this.view.h;
  }

  // figure out equivalent rect in render_rect frame
  var t = transform_rect(this, view_rect, render_rect);

  // skip drawing if too small - need both this and above?
  if (render_rect.w <= size_thresh || render_rect.h <= size_thresh) return;
  if (t.w <= size_thresh || t.h <= size_thresh) return;
  
  // draw self
  this.rect.lineStyle(this.line_width, this.line_color);
  this.rect.beginFill(this.color);
  this.rect.drawRect(t.x, t.y, t.w, t.h);
  
  // query the surface for stuff to draw - nothing fancy for now
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

// scale view
ViewRect.prototype.scale = function(dz) {
  var old_w = this.view.w, old_h = this.view.h;
  this.view.w = this.view.w * dz;
  this.view.h = this.view.h * dz;
  this.view.x = this.view.x - (this.view.w-old_w)/2;
  this.view.y = this.view.y - (this.view.h-old_h)/2;
};

// translate view
ViewRect.prototype.translate = function(dx, dy) {
  this.view.x += dx*this.view.w*trans_prop;
  this.view.y += dy*this.view.h*trans_prop;
};

ViewRect.prototype.handle_click = function(click, view_rect, render_rect, objs){
  // worth storing render_rect? or...just having it be global...
  // because I think it'll be the same for every call?
  // TODO: figure out how to 'pass along' click without re-transforming
  // in entirety every time

  // filter out things this click has been through
  objs = objs || {};
  objs[this.id] = true;
  
  // transform click to surface
  var surf = this.click_to_surface(click, view_rect, render_rect);

  // query that location
  var ids = this.quadtree.query(surf);
  // filter objects that have already handled - do this better (like in query)
  ids = ids.filter(function(id) { return !objs[id]; });

  // un-highlight previous thing
  if (this.highlighted != null)
    this.quadtree.obj_ids[this.highlighted].highlight(false);
  // highlight self?
  this.highlight(true);
  
  // tell whatever we clicked to handle it
  for(var i = 0; i < ids.length; i++) {
    var obj = this.quadtree.obj_ids[ids[i]];
    obj.handle_click(click, view_rect, render_rect, objs);
    // set as highlighted
    this.highlighted = ids[i];
  }

  // if not clicking anything, make a rectangle
  if (ids.length === 0)
    this.insert_rectangle(surf);
};

ViewRect.prototype.highlight = function(is_highlighted) {
  // highlight if is_highlighted is true, else un-highlight
  if (is_highlighted) {
    // should bold outline instead
    this.line_width = 1;
    this.line_color = 0xFF0000;
  } else {
    this.line_width = 1;
    this.line_color = 0x000000;
  }
};

ViewRect.prototype.insert_rectangle = function(rect) {
  // TODO: can combine both insert functions into one?
  // transform click to surface
  rect.w = 5; rect.h = 5;
  rect.stage = this.stage;
  
  // insert into quadtree
  qt.insert(new Rect(rect));
};

ViewRect.prototype.insert_viewrect = function() {

};

// transform from canvas click to location on surface
ViewRect.prototype.click_to_surface = function(click, view_rect, render_rect) {
  return transform_rect({x:click.x, y:click.y, w:1, h:1},
			transform_rect(this, view_rect, render_rect),
			this.view);
};

// 'transform' passed rect from a to b
function transform_rect(rect, a, b) {
  return {x: ((rect.x - a.x) / a.w) * b.w + b.x,
	  y: ((rect.y - a.y) / a.h) * b.h + b.y,
	  w: rect.w * (b.w / a.w),
	  h: rect.h * (b.h / a.h) };
}


