"use strict";

/*
- just go ahead and assume have access to jquery!
- DON'T DO single child stuff for now
- is having id->object actually useful considering things are references?
- should allow functions to take lists of things and/or multiple args
- Allow parent to absorb child when 'expanding'
- check to see if 'coarsen' leads to memory leaks
- Remove 'remove' from nodes if just using query. 
-- What else can move from node to quadtree?
*/

/*
function Quadtree(...) {
  // interface to actual quadtree as well as id->object and id->node maps
  this.root = ...;
};

// attempt to insert passed object (with x,y,w,h,id properties)
Quadtree.insert(...) {};

// remove all elements in a given region
Quadtree.remove_region(region) {
  // TODO: better just to query then use id->obj->node map?!!

  // to coarsen, just do a query and coarsen if few enough results?
  // make sure to remove keys from object instead of just setting to false
};
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
  
  this.ids = {};
};  

// attempt to insert object with given id into quadtree
QNode.prototype.insert = function(id) {
  var obj = this.quadtree.id_to_obj[id];

  // verify the passed object should actually be added
  if (this.overlaps(obj)) {
    // if have children, pass on to them
    if (this.children.length !== 0) {
      this.children.map( function(c) { c.insert(id) } );
    } else {
      // no children, add to self
      this.ids[id] = true;
      // need to refine if have too many objects at this level
      if (Object.keys(this.ids).length > this.max_objects) { // optimize?
	this.refine();
      }
    }
  } else if (this.layer === 0) {
    // need to 'expand' to accomodate external point
    this.expand(id);
  }
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
  this.ids = {};
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
  var self_center = {x: this.x+this.w/2, y: this.y+this.h/2};
  var targ_center = {x: obj.x+obj.w/2,   y: obj.y+obj.h/2};

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
    return {};
  }

  // if inside query region and have no children, return objects
  if (this.children.length === 0) {
    return filter_region(this.ids, region, this.quadtree.id_to_obj);
  }

  // otherwise delegate to children
  return $.extend.apply({}, this.children.map(
    function(c) { return c.query(region); }
  ));
};

QNode.prototype.clear = function() {

};

// see if passed region overlaps this node
QNode.prototype.overlaps = function(region) {
  return overlaps(this, region);
};
*/
// see if (AXIS-ALIGNED!) rectangles r1 and r2 overlap
function overlaps(r1, r2) {
  // TODO: does this handle edge intersections consistently and efficiently?
  // calculate centers and half-dimensions
  var r1c = {x: r1.x+r1.w/2, y: r1.y+r1.h/2};
  var r2c = {x: r2.x+r2.w/2, y: r2.y+r2.h/2};
  
  // see if distance between centers is <= corresponding dimensions
  var dx = Math.abs(r1c.x - r2c.x);
  var dy = Math.abs(r1c.y - r2c.y);
  var x_sum = r1.w/2 + r2.w/2;
  var y_sum = r1.h/2 + r2.h/2;

  // overlapping if too close not to be
  return (dx <= x_sum) && (dy <= y_sum);
};

// return object of ids internal to passed region
function filter_region(ids, region, objectify) {
  var i = 0, obj = {};
  // filter out external objects by id
  var keys = Object.keys(ids).filter( function(o) {
    return overlaps(region, objectify(o));
  });
  
  // then construct and return an id object from the filtered keys
  for (; i < keys.length; i++) obj[keys[i]] = true;
  return obj;
};
