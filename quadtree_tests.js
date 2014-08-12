
/* TESTS TODO/NOTES
- add 'stress tests' for adding lots of nodes (ideally compare to other
  quadtree libs before DELETING MERCILESSLY)
- test out inserting object that encompasses entire quadtree
- make sure proper number of subtrees after inserting and removing lots of nodes
*/

/* test overlaps */
QUnit.test( "overlaps tests", function( assert ) {
  var r1 = {x:0, y:0, w:100, h:100};
  var r2 = {x:10, y:10, w:1, h:1};
  var r3 = {x:20, y:-1000, w:1, h:2000};

  // self-overlaps
  assert.ok( overlaps(r1, r1) );
  assert.ok( overlaps(r2, r2) );
  assert.ok( overlaps(r3, r3) );

  // point-overlaps
  assert.ok( overlaps(r1, r2) );
  assert.ok( overlaps(r2, r1) );

  // weird skinny overlaps
  assert.ok( overlaps(r1, r3) );
  assert.ok( overlaps(r3, r1) );

  // non-overlaps
  assert.ok( !overlaps(r2, r3) );
  assert.ok( !overlaps(r3, r2) );
});

/* test filter_region */
QUnit.test( "filter_region tests", function( assert ) {
  var r1 = {x:0, y:0, w:100, h:100};
  var r2 = {x:10, y:10, w:1, h:1};
  var r3 = {x:10, y:10, w:1, h:1};
  var r4 = {x:10, y:10, w:1, h:1};
  var r5 = {x:20, y:-1000, w:1, h:2000};
  var r6 = {x:500, y:500, w:1, h:1};
  var id_to_obj = {1:r1, 2:r2, 3:r3, 4:r4, 5:r5, 6:r6};
  var ids = {1:true, 2:true, 3:true, 4:true, 5:true, 6:true};
  var objectify = function(key) { return id_to_obj[key] };

  assert.deepEqual( filter_region(ids, r1, objectify),
		    {1:true, 2:true, 3:true, 4:true, 5:true} );

  assert.deepEqual( filter_region(ids, r2, objectify),
		    {1:true, 2:true, 3:true, 4:true} );

  assert.deepEqual( filter_region(ids, r6, objectify),
		    {6:true} );
});


/* test filter_region */
QUnit.test( "filter_region adjacency tests", function( assert ) {
  var r = {x:10, y:10, w:1, h:1};
  // edges
  var ra = {x:10, y:9,  w:1, h:1};
  var rb = {x:10, y:11, w:1, h:1};
  var rl = {x:9,  y:10, w:1, h:1};
  var rr = {x:11, y:10, w:1, h:1};
  // diagonals
  var rtl = {x:9,  y:9,  w:1, h:1};
  var rtr = {x:11, y:9,  w:1, h:1};
  var rbl = {x:9,  y:11, w:1, h:1};
  var rbr = {x:11, y:11, w:1, h:1};

  var id_to_obj = {1:r,
		   2:ra, 3:rb, 4:rl, 5:rr,
		   6:rtl, 7:rtr, 8:rbl, 8:rbr};
  var ids = {1:true, 2:true, 3:true, 4:true, 5:true, 6:true, 7:true, 8:true};
  var objectify = function(key) { return id_to_obj[key] };

  assert.deepEqual( filter_region(ids, r, objectify),
		    {1:true} );
});

/* test sort_by_area */
QUnit.test( "sort_by_area tests", function( assert ) {
  var r1 = {w:100, h:100};
  var r2 = {w:1, h:1};
  var r3 = {w:3, h:1};
  var r4 = {w:2, h:1};
  var r5 = {w:1, h:2000};

  assert.deepEqual( sort_by_area([r1, r2, r3, r4, r5]),
		    [r1, r5, r3, r4, r2] );

  // test for error if one doesn't have w and h fields?
});

/* test refine */
QUnit.test( "refine tests", function( assert ) {
  var qt = new Quadtree({x:0, y:0, w:100, h:100});
  var r1 = {id:1, x:0,  y:0,  w:1, h:1};
  var r2 = {id:2, x:50, y:0,  w:1, h:1};
  var r3 = {id:3, x:0,  y:50, w:1, h:1};
  var r4 = {id:4, x:50, y:50, w:1, h:1};
  qt.insert(r1);
  qt.insert(r2);
  qt.insert(r3);
  qt.insert(r4);
  
  // make sure root has no children
  assert.deepEqual( qt.root.children.length, 0 );

  qt.root.refine();

  // make sure root has four children
  assert.deepEqual( qt.root.children.length, 4 );

});

/* test coarsen */
QUnit.test( "coarsen tests", function( assert ) {
  var qt = new Quadtree({x:0, y:0, w:100, h:100});
});

/* test expand */
QUnit.test( "expand tests", function( assert ) {
  var qt = new Quadtree({x:0, y:0, w:100, h:100});
});

/* test insert */
QUnit.test( "insert tests", function( assert ) {
  var qt = new Quadtree({x:0, y:0, w:100, h:100});
  var r1 = {id:1, x:0, y:0, w:100, h:100};
  var r2 = {id:2, x:10, y:10, w:1, h:1};
  var r3 = {id:3, x:10, y:10, w:1, h:1};
  var r4 = {id:4, x:10, y:10, w:1, h:1};
  var r5 = {id:5, x:20, y:-1000, w:1, h:2000};
  var r6 = {id:6, x:500, y:500, w:1, h:1};

  assert.deepEqual( qt.query({x:-1000, y:-1000, w:2000, h:2000}),
		    {});
  
  qt.insert(r1);
  qt.insert(r2);
  qt.insert(r3);
  qt.insert(r4);
  qt.insert(r5);
  qt.insert(r6);

  assert.deepEqual( qt.query({x:-1000, y:-1000, w:2000, h:2000}),
		    {1:true, 2:true, 3:true, 4:true, 5:true, 6:true});
});

/*
// test refine 
QUnit.test( "refine tests", function( assert ) {
});
*/

/*
var qt = new Quadtree({x:0, y:0, h:100, w:100});

var obj = {id: 123}

var p1 = {x:0, y:0, h:1, w:1};
var p2 = {x:-20, y:20, h:1, w:1};
var p3 = {x:233030, y:29832, h:1, w:1};

var r1 = {x:0, y:0, h:100, w:100};
var r2 = {x:100, y:0, h:100, w:100};
var r3 = {x:-237870, y:0, h:100, w:100};

qt.insert(p1);
qt.insert(p2, p3];
qt.remove(p1);
qt.remove(p2, p3);
*/
