
/*
- DON'T DO single child stuff for now
- is having id->object actually useful considering things are references?
- should allow functions to take lists of things and/or multiple args
- Allow parent to absorb child when 'expanding'
*/

function Quadtree(...) {
  // interface to actual quadtree as well as id->object and id->node maps
  this.root = ...;
};

// attempt to insert passed object (with x,y,w,h,id properties)
Quadtree.insert(...) {};

// remove all elements in a given region OR with a given ID
Quadtree.remove(...) {};

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
  var obj = this.quadtree.id_to_obj[id];

  if (this.overlaps(obj)) {
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

QNode.prototype.insert_object = function() {

};

// remove all elements in a given region OR with a given ID
QNode.prototype.remove = function() {
  // make sure to check about 'simplifying' tree
};

QNode.prototype.refine = function() {
  // create children and populate with own objects
  var i, j;

  for (i = 0; i < 4; i++) {
    this.children[i] = QNode(...);
  }
  
  for (i = 0; i < this.children.length; i++) {
    for (j = 0; j < this.ids.length; j++) {
      this.children[i].insert(this.ids[j]);
    }
  }

  // TODO: probably need to remove specially to keep quadtree structures updated
  this.ids = [];
};

QNode.prototype.coarsen = function() {
  // take contents of children and EAT THEM UP
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
  // don't return anything if outside query region
  if (!this.overlaps(region)) {
    return [];
  }

  // if inside query region and have no children, return objects
  if (this.children.length === 0) {    
    return this.ids;
  }

  // otherwise delegate to children
  return [].concat.apply([], this.children.map(
    function(c) { return c.query(region); }
  ));
};

QNode.prototype.clear = function() {

};

// see if passed region overlaps this node
QNode.prototype.overlaps = function(region) {
  // TODO: better name
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
