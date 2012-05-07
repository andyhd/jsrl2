(function () {

  var Game = this.Game ? this.Game : this.Game = {};

  var UIProto = {
    game: null,
    dimensions: null,
    maxDimension: null,
    centre: {x: 10, y: 10},
  };

  Game.UI = (function () {

    function UI(canvas) {
      this.canvas = canvas;
      this.canvas.width = 608;
      this.canvas.height = 342;
      this.dimensions = {
        x: Math.ceil(this.canvas.width / 16),
        y: Math.ceil(this.canvas.height / 16)
      };
      this.context = canvas.getContext('2d');
    };
    UI.prototype = UIProto;

    UI.prototype.update = function () {
      var c = this.context;
      c.fillStyle = 'rgb(0, 0, 0)';
      c.fillRect(0, 0, this.canvas.width, this.canvas.height);

      var offset = {
        x: ~~(this.dimensions.x / 2),
        y: ~~(this.dimensions.y / 2)
      };
      var viewport = new Game.Rect(
        {x: this.centre.x - offset.x, y: this.centre.y - offset.y},
        {x: this.centre.x + offset.x, y: this.centre.y + offset.y}
      );

      if (Game.map) {
        var tilesInView = Game.map.queryRange(viewport);
        tilesInView.map(function (tile) {

          // get screen coords
          var screen = {
            x: (tile.x - viewport.w) * 16,
            y: (tile.y - viewport.n) * 16
          };

          // draw tile
          var img = document.getElementById(tile.name);
          var sprite = {x: 0, y: 0};
          if (tile.offset) {
            sprite = {x: tile.offset.x * 16, y: tile.offset.y * 16};
          }
          c.drawImage(
            img,
            sprite.x, sprite.y, 16, 16,
            screen.x, screen.y, 16, 16
          );
        });
      }
    };

    UI.prototype.spriteOffsetForSurround = spriteOffsetForSurround;

    return UI;
  })();

  function calcWallTiles(tiles) {
    var width = tiles[0].length;
    var height = tiles.length;
    var area = width * height;
    var x, y, i, t;

    for (i = 0; i < area; i++) {
      x = x1 + (i % width), y = y1 + ~~(i / width);

      t = tiles[y][x];
      if (t != 1) {
        continue;
      }

      t.offset = spriteOffsetForSurround(t);
    }
  }

  function spriteOffsetForSurround(tile, tiles) {
    var s = surrounding(tile, tiles);
    return (s & 2) ? (s & 8) ? (s & 32) ? (s & 128) ? (s & (1 | 4 | 64 | 256)) ?
      [4,2] : [4,1] : (s & (1 | 4)) ? [2,4] : [2,3] : (s & 128) ? (s & (1 | 64))
      ? [0,3] : [0,2] : (s & 1) ? [3,4] : [3,3] : (s & 32) ? (s & 128) ? (s & (4
      | 256)) ? [3,2] : [3,1] : (s & 4) ? [1,4] : [1,3] : (s & 128) ? [1,2] :
      [4,3] : (s & 8) ? (s & 32) ? (s & 128) ? (s & (64 | 256)) ? [1,1] : [1,0] :
      [2,2] : (s & 128) ? (s & 64) ? [2,1] : [2,0] : [0,4] : (s & 32) ? (s &
      128) ? (s & 256) ? [0,1] : [0,0] : [4,0] : (s & 128) ? [3,0] : [4,4];
  }

  function surrounding(tile, tiles) {
    var flags = 0;
    var x, y, i, t;
    for (i = 0; i < 9; i++) {
      if (i == 4) continue;
      x = tile.x - 1 + (i % 3), y = tile.y - 1 + (~~(i / 3));
      if (x >= 0 && x < tiles[0].length && y >= 0 && y < tiles.length) {
        t = tiles[y][x];
        if (t && t == tile.type) {
          flags ^= 1 << i;
        }
      }
    }
    return flags;
  }

})();
