
/*
- DON'T DO single child stuff for now
- is having id->object actually useful considering things are references?
- should allow functions to take lists of things
*/

function Quadtree(...) {
  // interface to actual quadtree as well as id->object and id->node maps
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
  // find where obj should belong
  // also test children
  // also need to test if external (and level 0) - need to insert self
  // into larger quadtree
  var c;

  if (this.overlaps(id)) {
    if (this.children.length === 0) {
      this.ids.push[id];
      
      // need to refine if have too many objects at this level
      if (this.ids.length > this.max_objects) {
	this.refine();
      }
    } else {
      // have children, pass on to them
      for (c = 0; c < this.children.length; c++) {
	this.children[c].insert(id);
      }
    }
  } else if (this.layer === 0) {
    // need to 'expand' to accomodate external point
    // TODO
    // change to have explicitly separate children? (so can set easier)
    // then maybe just have convenience function to return list of children
  }
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
    for (j = 0; j < this.objects.length; j++) {
      this.children[i].insert(this.objects[j]);
    }
  }

  // TODO: probably need to remove specially to keep quadtree structures updated
  this.objects = [];
};

QNode.prototype.coarsen = function() {
  // take contents of children and EAT THEM UP
}

QNode.prototype.query = function() {

};

QNode.prototype.clear = function() {

};

// see if passed id should be tracked by this node
QNode.prototype.overlaps = function(id) {
  // TODO: better name
  return overlaps(this, this.quadtree.id_to_obj[id]); // need to try both dirs?
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
}
