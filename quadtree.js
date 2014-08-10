
/*
- DON'T DO single child stuff for now
- is having id->object actually useful considering things are references?
- should allow functions to take lists of things and/or multiple args
- Allow parent to absorb child when 'expanding'
- check to see if 'coarsen' leads to memory leaks
- change id list to object?? so can treat like a set
*/

function Quadtree(...) {
  // interface to actual quadtree as well as id->object and id->node maps
  this.root = ...;
};

// attempt to insert passed object (with x,y,w,h,id properties)
Quadtree.insert(...) {};

// remove all elements in a given region
Quadtree.remove_region(region) {};
// remove all elements with a given id
Quadtree.remove_object(id) {};



// a node in the quadtree
function QNode(...) {
  this.quadtree    = quadtree;
  this.max_objects = ... || 50;
  this.max_level   = ... || 10;
  this.level       = level || 0;

  this.parent   = parent;
  this.children = [];
  
  this.ids = [];
};  

// attempt to insert object with given id into quadtree
QNode.prototype.insert = function(id) {
  // TODO: only insert if not there already
  
  var obj = this.quadtree.id_to_obj[id];

  // verify the passed object should actually be added
  if (this.overlaps(obj)) {
    // if have children, pass on to them
    if (this.children.length !== 0) {
      this.children.map( function(c) { c.insert(id) } );
    } else {
      // no children, add to self
      this.ids.push[id];
      // need to refine if have too many objects at this level
      if (this.ids.length > this.max_objects) {
	this.refine();
      }
    }
  } else if (this.layer === 0) {
    // need to 'expand' to accomodate external point
    this.expand(id);
  }
};

// remove all elements in a given region
QNode.prototype.remove = function(region) {
  // TODO: better just to query then use id->obj->node map?!!

  // to coarsen, just do a query and coarsen if few enough results?
};

QNode.prototype.refine = function() {
  // create children
  this.children[0] = QNode(...); // upper-left
  this.children[1] = QNode(...); // upper-right
  this.children[2] = QNode(...); // lower-left
  this.children[3] = QNode(...); // lower-right

  // populate with own ids
  this.children.map(
    function(c) { this.ids.map( function(id) { c.insert(id); }) }
  );

  // clear own ids
  // TODO: probably need to remove specially to keep quadtree structures updated
  this.ids = [];
};

// take contents of children and EAT THEM UP
QNode.prototype.coarsen = function() {
  // grab all ids belonging to children
  self.ids = this.query({x: this.x; y: this.y; w: this.w; h: this.h});
  // destroy children :(
  this.children = []; // MEMORY LEAKS?
};

// expand to accomodate object external to current quadtree
QNode.prototype.expand = function(id) {
  // TODO: do some checks?
  // figure out what quadrant to expand towards
  var obj = this.quadtree.id_to_obj[id];
  var self_center = {x: this.x+this.w/2; y: this.y+this.h/2};
  var targ_center = {x: obj.x+obj.w/2;   y: obj.y+obj.h/2};

  // figure out relative orientation
  var targ_is_left  = targ_center.x < self_center.x;
  var targ_is_above = targ_center.y > self_center.y;
  var goal_quadrant = targ_is_left + targ_is_above*2;
  
  // insert accordingly
  this.quadtree.root = new Qnode(...); // MAKE SURE TO SET DIMS APPROPRIATELY
  this.quadtree.root.refine();
  this.quadtree.root.children[goal_quadrant] = this;
  this.quadtree.root.insert(id);
};

// return a list of objects located in the given region
QNode.prototype.query = function(region) {
  var results = [];
  
  // don't return anything if outside query region
  if (!this.overlaps(region)) {
    results = [];
  }

  // if inside query region and have no children, return objects
  else if (this.children.length === 0) {    
    results = this.ids;
  }

  // otherwise delegate to children
  else {
    results = [].concat.apply([], this.children.map(
      function(c) { return c.query(region); }
    ));
  }

  // filter duplicates and things outside desired region
  return remove_duplicates(filter_region(this.ids, region,
					 this.quadtree.id_to_obj));
};

QNode.prototype.clear = function() {

};

// see if passed region overlaps this node
QNode.prototype.overlaps = function(region) {
  return overlaps(this, region); // need to try both dirs?
};

// check if rectangle r1 overlaps with rectangle r2
function overlaps(r1, r2) {
  var corners = [{x: r2.x,      y: r2.y},
		 {x: r2.x+r2.w, y: r2.y},
		 {x: r2.x,      y: r2.y+r2.h},
		 {x: r2.x+r2.w, y: r2.y+r2.h}];
  
  return corners.some(function(c) { contains(r1, c); });
};

// check if rectangle r contains point p
function contains(r, p) {
  return p.x >= r.x && p.x < r.x+r.w && p.y >= r.y && p.y < r.y+r.h;
};

function remove_duplicates(array) {
  // only works for arrays of primitives...also kinda gross.
  var seen = {};
  return array.filter(function(x) { return !seen[x] && (seen[x] = 1); });
};

// remove elements from array of ids that are external to given region
function filter_region(array, region, objectify) {
  return array.filter(function(id) { return contains(region, objectify(id)) } );
};
