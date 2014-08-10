
/* TESTS TODO/NOTES
- add 'stress tests' for adding lots of nodes (ideally compare to other
  quadtree libs before DELETING MERCILESSLY)
- test out inserting object that encompasses entire quadtree
- make sure proper number of subtrees after inserting and removing lots of nodes
*/

var qt = new Quadtree({x:0, y:0, h:100, w:100});

var obj = {id: 123}

var p1 = {x:0, y:0, h:1, w:1, object:};
var p2 = {x:-20, y:20, h:1, w:1};
var p3 = {x:233030, y:29832, h:1, w:1};

var r1 = {x:0, y:0, h:100, w:100};
var r2 = {x:100, y:0, h:100, w:100};
var r3 = {x:-237870, y:0, h:100, w:100};

qt.insert(p1);
qt.insert(p2, p3];
qt.remove(p1);
qt.remove(p2, p3);
