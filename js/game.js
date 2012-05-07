(function () {

  // create or append to namespace
  var Game = this.Game ? this.Game : this.Game = {};
  Game.turn = 0;
  Game.map = null;
  Game.player = {x: 4, y: 4};
  Game.ui = null;

  function mobs(tile) {
    return tile.mobs;
  }

  function act(mob) {
    return mob.act();
  }

  Game.nextTurn = function () {

    // test for victory/faiure conditions
    //if (player.dead) {
    //  Game.over();
    //}

    // have all mobs in range perform their action
    //map.queryRange(AABB(player.coords, 20)).filter(mobs).map(act);

    // increment turn counter
    Game.turn++;

    // refresh the ui
    Game.ui.update();

  };

  Game.over = function () {
    console.log("Game over!");
  };

  Game.start = function () {
    document.onkeypress = function (e) {
      if (Game.UserControl.act(e)) {
        Game.nextTurn();
      }
    };
    Game.ui.update();
  };

  function nearestPowerOf2(n) {
    if (n == 0) return 0;
    for (var x = 1; x < n; x <<= 1);
    return x;
  }

  Game.loadMap = function (data) {
    var height = data.map.length;
    var width = data.map[0].length;
    var maxDim = Math.max(width, height);
    var mapHalfDim = nearestPowerOf2(maxDim) / 2;
    var bbox = new Game.AABB({x: mapHalfDim, y: mapHalfDim}, mapHalfDim);
    var map = new Game.QuadTree(bbox);
    var area = width * height;
    var x, y, i, t, offset;

    for (i = 0; i < area; i++) {
      x = i % width, y = ~~(i / width);
      t = data.map[y][x];
      if (t) {
        tile = {
          x: x, y: y,
          name: data.legend[t].name,
          type: t,
        };
        if (tile.name == 'wall') {
          offset = Game.ui.spriteOffsetForSurround(tile, data.map);
          tile.offset = {x: offset[0], y: offset[1]};
        }
        map.insert(tile);
      }
    }

    Game.map = map;
  };

})();
