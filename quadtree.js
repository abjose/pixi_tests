"use strict";

/*
- just go ahead and assume have access to jquery!
- is having id->object actually useful considering things are references?
- should allow functions to take lists of things and/or multiple args
- check to see if 'coarsen' leads to memory leaks
- replace Object.keys(stuff) with other things? Maybe not that inefficient...
- replace max_objects with refine_thresh and coarsen_thresh
- test out coarsen vs. coarsen_topdown - maybe use topdown in remove_region?
*/


function Quadtree(args) {
  // required: x, y, w, h
  // optional: max_objects, max_level
  this.max_objects = args.max_objects || 50;
  this.max_level   = args.max_level   || 10;

  // root of quadtree
  this.root = QNode({x:args.x, y:args.y, w:args.w, h:args.h,
		     level:0, parent:null, quadtree:this});
  // id-to-object mapping - is this even necessary?
  this.id_to_obj   = {};
  // object-to-node mapping - for each object, track referencing nodes
  this.obj_to_node = {};
};

// attempt to insert passed object (with x,y,w,h,id properties)
Quadtree.prototype.insert = function(obj) {
  // first need to add to id-to-object map
  this.id_to_obj[obj.id] = obj;
  // then insert into the root - will automatically update obj_to_node
  this.root.insert(obj.id);
};

// return a list of objects located in the given region
Quadtree.prototype.query = function(region) {
  return this.root.query(region);
}

// remove all references to the object with the given id
Quadtree.prototype.remove_object = function(id) {
  // grab affected nodes
  var nodes = this.obj_to_node[this.id_to_obj[id]];
  // tell them all to remove the object and try to coarsen
  nodes.map( function(n) {
    delete n.ids[id];
    n.coarsen();
  } );
  // then remove the object from id_to_obj
  delete this.id_to_obj[id];
};

// remove all elements in a given region
// TODO: consider using coarsen_topdown
Quadtree.prototype.remove_region = function(region) {
  // query root to figure out what ids are in the passed region
  var ids = this.query(region);
  // kill them all
  ids.map( function(id) { this.remove_object(id); } );  
};

// delete all objects from the quadtree (leaving dimensions, etc. the same)
Quadtree.prototype.clear = function() {
  this.root.children = []; // MEMORY LEAKS?!?!?!?!?!
  this.root.ids = {};
};

// a node in the quadtree
function QNode(args) {
  // required: x, y, w, h, level, parent, quadtree,
  this.x = args.x; this.y = args.y;
  this.w = args.w; this.h = args.h;
  this.quadtree = args.quadtree;
  this.level    = level || 0;

  // keep track of tree-y information
  this.parent   = args.parent;
  this.children = [];

  // keep track of ids of objects belonging to this node
  this.ids = {};
};  

// attempt to insert object with given id into quadtree
QNode.prototype.insert = function(id) {
  // TODO: NEED TO MODIFY obj_to_node!!!
  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  
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
      if (Object.keys(this.ids).length > this.quadtree.max_objects) {
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
  //this.children[0] = QNode(...); // upper-left
  //this.children[1] = QNode(...); // upper-right
  //this.children[2] = QNode(...); // lower-left
  //this.children[3] = QNode(...); // lower-right

  // populate with own ids
  this.children.map(
    function(c) { this.ids.map( function(id) { c.insert(id); }) }
  );

  // clear own ids
  // TODO: probably need to remove specially to keep quadtree structures updated
  // like need to remove this node from obj_to_node
  this.ids = {};
};

// merge children into self (if necessary)
QNode.prototype.coarsen = function() {
  // do we have children?
  if (this.children.length !== 0) {
    // grab children's ids
    var child_ids = this.query({x:this.x, y:this.y, w:this.w, h:this.h});
    
    // do we need to coarsen?
    if (Object.keys(child_ids).length < this.quadtree.max_objects) {
      // subsume and destroy children
      self.ids = child_ids;
      this.children = []; // MEMORY LEAKS?
      // tell parent that it should consider coarsening
      this.parent.coarsen();
    }
  }
};

// merge children into self in a top-down way
QNode.prototype.coarsen_topdown = function(region, filtered_ids) {
  // if self intersects with region to coarsen...
  if (this.overlaps(region)) {
    // do initial query if no ids passed
    filtered_ids = filtered_ids || this.query(region);
    
    // filter passed ids to own region
    filtered_ids = filter_region(filtered_ids, region, this.quadtree.id_to_obj);

    // if few enough filtered ids, coarsen
    if (filtered_ids.length < this.quadtree.max_objects) {
      self.ids = filtered_ids;
      this.children = []; // MEMORY LEAKS?
    } else if (this.children.length !== 0) {
      // if didn't coarsen, tell children to try (passing newly filtered ids)
      this.children.map(function(c) {c.coarsen_topdown(region, filtered_ids) });
    }
  }
};

// expand to accomodate object external to current quadtree
QNode.prototype.expand = function(id) {
  // TODO: do some checks?
  // TODO: make sure parent can coarsen if necessary?
  // figure out what quadrant to expand towards
  var obj = this.quadtree.id_to_obj[id];
  var self_center = {x: this.x+this.w/2, y: this.y+this.h/2};
  var targ_center = {x: obj.x+obj.w/2,   y: obj.y+obj.h/2};

  // figure out relative orientation
  var targ_is_left  = targ_center.x < self_center.x;
  var targ_is_above = targ_center.y > self_center.y;
  var goal_quadrant = targ_is_left + targ_is_above*2;
  
  // insert accordingly
  //this.quadtree.root = new Qnode(...); // MAKE SURE TO SET DIMS APPROPRIATELY
  this.quadtree.root.refine();
  this.quadtree.root.children[goal_quadrant] = this;
  // sure you should coarsen here?
  this.quadtree.root.coarsen();
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

// see if passed region overlaps this node
QNode.prototype.overlaps = function(region) {
  return overlaps(this, region);
};

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
  return (dx < x_sum) && (dy < y_sum);
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

// order list of objects with w (width) and h (height) fields by decreasing area
// TODO: ARE YOU GOING TO USE THIS??
function sort_by_area(nodes) {
  return nodes.sort( function(a, b) { return b.w*b.h - a.w*a.h; });
}
