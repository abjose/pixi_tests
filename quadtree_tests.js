
/* TESTS TODO/NOTES
- add 'stress tests' for adding lots of nodes (ideally compare to other
  quadtree libs before DELETING MERCILESSLY)
- make sure proper number of subtrees after inserting and removing lots of nodes
- WEIRD BEHAVIOR for very large enlarges
- verify doesn't exceed max depth or max objects under normal insertion
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

/* test contains */
QUnit.test( "contains tests", function( assert ) {
  var r1 = {x:0, y:0, w:100, h:100};
  var r2 = {x:10, y:10, w:1, h:1};
  var r3 = {x:20, y:-1000, w:1, h:2000};

  // self-contains
  assert.ok( contains(r1, r1) );
  assert.ok( contains(r2, r2) );
  assert.ok( contains(r3, r3) );

  // point-contains
  assert.ok( contains(r1, r2) );
  assert.ok( !contains(r2, r1) );

  // weird skinny contains
  assert.ok( !contains(r1, r3) );
  assert.ok( !contains(r3, r1) );

  // non-contains
  assert.ok( !contains(r2, r3) );
  assert.ok( !contains(r3, r2) );
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

  assert.deepEqual( filter_region(ids, r1, id_to_obj),
		    {1:true, 2:true, 3:true, 4:true, 5:true} );

  assert.deepEqual( filter_region(ids, r2, id_to_obj),
		    {1:true, 2:true, 3:true, 4:true} );

  assert.deepEqual( filter_region(ids, r6, id_to_obj),
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

  assert.deepEqual( filter_region(ids, r, id_to_obj),
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
  // make sure the objects are in the right places
  assert.deepEqual( qt.query({x:0, y:0, w:100, h:100}),
		    {1:true, 2:true, 3:true, 4:true} );

  qt.root.refine();

  // make sure root has four children
  assert.deepEqual( qt.root.children.length, 4 );
  // make sure the objects are in the right places
  assert.deepEqual( qt.root.children[0].query({x:0, y:0, w:100, h:100}),
		    {1:true} );
  assert.deepEqual( qt.root.children[1].query({x:0, y:0, w:100, h:100}),
		    {2:true} );
  assert.deepEqual( qt.root.children[2].query({x:0, y:0, w:100, h:100}),
		    {3:true} );
  assert.deepEqual( qt.root.children[3].query({x:0, y:0, w:100, h:100}),
		    {4:true} );
});

/* test coarsen */
QUnit.test( "coarsen tests", function( assert ) {
  var qt = new Quadtree({x:0, y:0, w:100, h:100});
  var r1 = {id:1, x:0,  y:0,  w:1, h:1};
  var r2 = {id:2, x:50, y:0,  w:1, h:1};
  var r3 = {id:3, x:0,  y:50, w:1, h:1};
  var r4 = {id:4, x:50, y:50, w:1, h:1};
  qt.insert(r1);
  qt.insert(r2);
  qt.insert(r3);
  qt.insert(r4);

  // force a refine
  qt.root.refine();

  // force a coarsen
  qt.root.coarsen();

  // make sure root has no children
  assert.deepEqual( qt.root.children.length, 0 );
  // make sure the objects are in the right places
  assert.deepEqual( qt.query({x:0, y:0, w:100, h:100}),
		    {1:true, 2:true, 3:true, 4:true} );
});

/* test top-down coarsen */
QUnit.test( "top-down coarsen tests", function( assert ) {
  var qt = new Quadtree({x:0, y:0, w:100, h:100});
  var r1 = {id:1, x:0,  y:0,  w:1, h:1};
  var r2 = {id:2, x:50, y:0,  w:1, h:1};
  var r3 = {id:3, x:0,  y:50, w:1, h:1};
  var r4 = {id:4, x:50, y:50, w:1, h:1};
  qt.insert(r1);
  qt.insert(r2);
  qt.insert(r3);
  qt.insert(r4);

  // force a refine
  qt.root.refine();

  // force a top-down coarsen
  qt.root.coarsen_topdown({x:0, y:0, w:100, h:100});

  // make sure root has no children
  assert.deepEqual( qt.root.children.length, 0 );
  // make sure the objects are in the right places
  assert.deepEqual( qt.query({x:0, y:0, w:100, h:100}),
		    {1:true, 2:true, 3:true, 4:true} );
});

/* test expand */
QUnit.test( "expand tests", function( assert ) {
  var qt = new Quadtree({x:0, y:0, w:100, h:100});
  var r1 = {id:1, x:0,  y:0,  w:1, h:1};
  var r2 = {id:2, x:50, y:0,  w:1, h:1};
  var r3 = {id:3, x:0,  y:50, w:1, h:1};
  var r4 = {id:4, x:50, y:50, w:1, h:1};
  // requires just one expansion
  var r5 = {id:5, x:150, y:150, w:1, h:1};
  // require many expansions
  var r6 = {id:6, x:5000,   y:5000,   w:1, h:1};
  var r7 = {id:7, x:500000, y:500000, w:1, h:1};
  // and in the other directions...
  var r8  = {id:8,  x:-50000000,     y: 50000000,     w:1, h:1};
  var r9  = {id:9,  x: 5000000000,   y:-5000000000,   w:1, h:1};
  var r10 = {id:10, x:-500000000000, y:-500000000000, w:1, h:1};
  // its presence surrounds us
  // TRY SWITCHING BETWEEN THESE TWO - WEIRD BEHAVIOR!
  //var r11 = {id:11, x:-2e60, y:-2e60, w:4e60, h:4e60};
  //var r11 = {id:11, x:-2e60, y:-2e60, w:4e61, h:4e61};
  var r11 = {id:11, x:-2e10, y:-2e10, w:4e11, h:4e11};

  // insert boring objects
  qt.insert(r1);
  qt.insert(r2);
  qt.insert(r3);
  qt.insert(r4);

  // insert smaller enlarge
  qt.insert(r5);
  // make sure root has no children i.e. coarsen 'bubbled up' properly
  assert.deepEqual( qt.root.children.length, 0 );
  // make sure the new object was inserted
  assert.deepEqual( qt.query(),
		    {1:true, 2:true, 3:true, 4:true, 5:true} );

  qt.insert(r6);
  // make sure root has no children i.e. coarsen 'bubbled up' properly
  assert.deepEqual( qt.root.children.length, 0 );
  // make sure the new object was inserted
  assert.deepEqual( qt.query(),
		    {1:true, 2:true, 3:true, 4:true, 5:true, 6:true} );

  qt.insert(r7);
  // make sure root has no children i.e. coarsen 'bubbled up' properly
  assert.deepEqual( qt.root.children.length, 0 );
  // make sure the new object was inserted
  assert.deepEqual( qt.query(),
		    {1:true, 2:true, 3:true, 4:true, 5:true, 6:true, 7:true} );

  qt.insert(r8);
  // make sure root has no children i.e. coarsen 'bubbled up' properly
  assert.deepEqual( qt.root.children.length, 0 );
  // make sure the new object was inserted
  assert.deepEqual( qt.query(),
		    {1:true, 2:true, 3:true, 4:true, 5:true, 6:true, 7:true,
		     8:true} );

  qt.insert(r9);
  // make sure root has no children i.e. coarsen 'bubbled up' properly
  assert.deepEqual( qt.root.children.length, 0 );
  // make sure the new object was inserted
  assert.deepEqual( qt.query(),
		    {1:true, 2:true, 3:true, 4:true, 5:true, 6:true, 7:true,
		     8:true, 9:true} );

  qt.insert(r10);
  // make sure root has no children i.e. coarsen 'bubbled up' properly
  assert.deepEqual( qt.root.children.length, 0 );
  // make sure the new object was inserted
  assert.deepEqual( qt.query(),
		    {1:true, 2:true, 3:true, 4:true, 5:true, 6:true, 7:true,
		     8:true, 9:true, 10:true} );

  qt.insert(r11);
  // make sure root has no children i.e. coarsen 'bubbled up' properly
  assert.deepEqual( qt.root.children.length, 0 );
  // make sure the new object was inserted
  assert.deepEqual( qt.query(),
		    {1:true, 2:true, 3:true, 4:true, 5:true, 6:true, 7:true,
		     8:true, 9:true, 10:true, 11:true} );
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

  
  qt.insert(r1);
  qt.insert(r2);
  qt.insert(r3);
  qt.insert(r4);
  qt.insert(r5);
  qt.insert(r6);

  assert.deepEqual( qt.query({x:-1000, y:-1000, w:2000, h:2000}),
		    {1:true, 2:true, 3:true, 4:true, 5:true, 6:true});
});

// test remove_by_region
QUnit.test( "remove_by_region tests", function( assert ) {
  var qt = new Quadtree({x:0, y:0, w:100, h:100});
  var r1 = {id:1, x:0, y:0, w:100, h:100};
  var r2 = {id:2, x:10, y:10, w:1, h:1};
  var r3 = {id:3, x:10, y:10, w:1, h:1};
  var r4 = {id:4, x:10, y:10, w:1, h:1};
  var r5 = {id:5, x:20, y:-1000, w:1, h:2000};
  var r6 = {id:6, x:-500, y:-500, w:1000, h:1000};
  qt.insert(r1);
  qt.insert(r2);
  qt.insert(r3);
  qt.insert(r4);
  qt.insert(r5);
  qt.insert(r6);

  qt.remove_by_region({x:19, y:-1000, w:2, h:1});
  assert.deepEqual( qt.query(), {1:true, 2:true, 3:true, 4:true, 6:true});
  
  qt.remove_by_region({x:-500, y:-500, w:2, h:1});
  assert.deepEqual( qt.query(), {1:true, 2:true, 3:true, 4:true});
});

// test remove_by_id
QUnit.test( "remove_by_id tests", function( assert ) {
  var qt = new Quadtree({x:0, y:0, w:100, h:100});
  var r1 = {id:1, x:0, y:0, w:100, h:100};
  var r2 = {id:2, x:10, y:10, w:1, h:1};
  var r3 = {id:3, x:10, y:10, w:1, h:1};
  var r4 = {id:4, x:10, y:10, w:1, h:1};
  var r5 = {id:5, x:20, y:-1000, w:1, h:2000};
  var r6 = {id:6, x:-500, y:-500, w:1000, h:1000};
  qt.insert(r1);
  qt.insert(r2);
  qt.insert(r3);
  qt.insert(r4);
  qt.insert(r5);
  qt.insert(r6);

  qt.remove_by_id(r6.id);
  assert.deepEqual( qt.query(), {1:true, 2:true, 3:true, 4:true, 5:true});
  
  qt.remove_by_id(r2.id);
  assert.deepEqual( qt.query(), {1:true, 3:true, 4:true, 5:true});
});

// test clear
QUnit.test( "clear tests", function( assert ) {
  var qt = new Quadtree({x:0, y:0, w:100, h:100});
  var r1 = {id:1, x:0, y:0, w:100, h:100};
  var r2 = {id:2, x:10, y:10, w:1, h:1};
  var r3 = {id:3, x:10, y:10, w:1, h:1};
  var r4 = {id:4, x:10, y:10, w:1, h:1};
  var r5 = {id:5, x:20, y:-1000, w:1, h:2000};
  var r6 = {id:6, x:-500, y:-500, w:1000, h:1000};
  qt.insert(r1);
  qt.insert(r2);
  qt.insert(r3);
  qt.insert(r4);
  qt.insert(r5);
  qt.insert(r6);

  qt.clear();
  assert.deepEqual( qt.query(), {});
});


// stress tests
QUnit.test( "stress tests", function( assert ) {
  var x=0, y=0, w=100, h=100;
  var qt = new Quadtree({x:x, y:y, w:w, h:h});
  var i=0, region={};
  var matches={};

  for (; i < 100; i++) {
    matches[i] = true;
    region = {id: i,
	      x: Math.random()*w + x,
	      y: Math.random()*h + y,
	      w: Math.random()*w,
	      h: Math.random()*h};
    qt.insert(region);
    console.log(qt);
  }

  assert.deepEqual( qt.query(), matches);

  qt.clear();
  assert.deepEqual( qt.query(), {});
});
