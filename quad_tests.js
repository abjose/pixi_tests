//var myTree = new Quadtree({
var myTree = new QUAD.init({
  x: 0,
  y: 0,
  w: 200,
  h: 200
});
myTree.insert({
    x : 100,
    y : 100,
    w : 1,
    h : 1
});
myTree.insert({
    x : 150,
    y : 150,
    w : 10,
    h : 10
});
myTree.insert({
    x : 50,
    y : 50,
    w : 5,
    h : 5
});
myTree.insert({
    x : 75,
    y : 75,
    w : 6,
    h : 6
});
//var elements = myTree.retrieve({
myTree.retrieve({
    x : 150,
    y : 150,
    w : 1,
    h : 1
}, function(item) {
  console.log(item);
});
