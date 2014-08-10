
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
  var r3 = {x:20, y:-1000, w:1, h:2000};
  var id_to_obj = {1:r1, 2:r2, 3:r3};
  var ids = {1:true, 2:true, 3:true}
  var objectify = function(key) { return id_to_obj[key] };

  assert.deepEqual( filter_region(ids, r1, objectify),
		    {1:true, 2:true, 3:true} );
});

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
