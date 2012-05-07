(function () {

  var Game = this.Game ? this.Game : this.Game = {};

  function Rect(nw, se) {
    this.nw = nw;
    this.se = se;
    this.n = nw.y;
    this.w = nw.x;
    this.e = se.x;
    this.s = se.y;
  }

  function contains(p) {
    return p.x >= this.w && p.x < this.e && p.y >= this.n && p.y < this.s;
  }
  Rect.prototype.contains = contains;

  function intersects(other) {
    return !(other.w > this.e || other.e < this.w || other.n > this.s ||
      other.s < this.n);
  }
  Rect.prototype.intersects = intersects;

  Game.Rect = Rect;

  function AABB(centre, halfDimension) {
    this.centre = centre;
    this.halfDimension = halfDimension;
    this.w = (centre.x - halfDimension);
    this.e = (centre.x + halfDimension);
    this.n = (centre.y - halfDimension);
    this.s = (centre.y + halfDimension);
  }

  AABB.prototype.contains = contains;

  AABB.prototype.intersects = intersects;

  AABB.prototype.subdivide = function () {

    // refuse to subdivide a single point
    if (this.halfDimension == 1) {
      return false;
    }

    var half = this.halfDimension / 2;
    return {
      'nw': new AABB({'x': this.w + half, 'y': this.n + half}, half),
      'ne': new AABB({'x': this.centre.x + half, 'y': this.n + half}, half),
      'se': new AABB({'x': this.centre.x + half, 'y': this.centre.y + half}, half),
      'sw': new AABB({'x': this.w + half, 'y': this.centre.y + half}, half)
    };
  };

  Game.AABB = AABB;

  function QuadTree(bbox) {
    this.bbox = bbox;
    this.points = [];
    this.nw = null;
    this.ne = null;
    this.se = null;
    this.sw = null;
  }

  QuadTree.NODE_CAPACITY = 4;

  QuadTree.prototype.insert = function (p) {

    // ignore points which don't belong in this trie
    if (this.bbox.contains(p)) {

      // if there is space, add the point
      if (this.points.length < QuadTree.NODE_CAPACITY) {
        this.points.push(p);
        return true;
      }

      // otherwise, we need to subdivide and add the point to whichever
      // node will accept it
      if (this.nw == null) {
        this.subdivide();
      }

      if (this.nw.insert(p)) return true;
      if (this.ne.insert(p)) return true;
      if (this.se.insert(p)) return true;
      if (this.sw.insert(p)) return true;
    }

    // point cannot be inserted for some reason
    return false;
  };

  QuadTree.prototype.subdivide = function () {

    // create four children which fully divide this quad into four quads of
    // equal area
    var quads = this.bbox.subdivide();
    if (quads) {
      this.nw = new QuadTree(quads.nw);
      this.ne = new QuadTree(quads.ne);
      this.se = new QuadTree(quads.se);
      this.sw = new QuadTree(quads.sw);
      return true;
    }

    // couldn't subdivide
    return false;
  };

  QuadTree.prototype.queryRange = function (range) {
    var inRange = [];

    // abort if range does not collide with this quad
    if (this.bbox.intersects(range)) {

      // check points at this quad level
      this.points.map(function (p) {
        if (range.contains(p)) {
          inRange.push(p);
        }
      });

      // check children
      if (this.nw != null) {
        inRange = inRange.concat(
          this.nw.queryRange(range),
          this.ne.queryRange(range),
          this.se.queryRange(range),
          this.sw.queryRange(range)
        );
      }
    }

    return inRange;
  };

  Game.QuadTree = QuadTree;

})();
