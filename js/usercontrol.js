(function () {

  Game.UserControl = (function () {

    function UserControl() {};
    UserControl.prototype = Game.Behaviour;

    UserControl.prototype.state = null;

    UserControl.prototype.act = function (e) {
      this.updateState();
      return this.state.keyPressed(e.charCode || e.keyCode);
    };

    UserControl.prototype.updateState = function () {
      if (this.state == null) {
        this.state = new UserControl.Move();
      }
      if (this.state.ended) {
        this.state = this.state.next;
      }
    };

    var StateProto = {
      ended: false,
      next: null
    };

    UserControl.Move = (function () {

      function move(x, y) {
        return function () { console.log('move('+x+', '+y+')'); return true }; //UserControl.mob.move(x, y) };
      }

      function State() {};
      State.prototype = StateProto;

      State.prototype.bindings = {
        104: move(-1, 0), // h
        108: move(1, 0), // l
        106: move(0, 1), // j
        107: move(0, -1), // k
        121: move(-1, -1), // y
        117: move(1, -1), // u
        98: move(-1, 1), // b
        110: move(1, 1), // n
      };

      State.prototype.keyPressed = function (key) {
        if (key in this.bindings) {
          return this.bindings[key](key);
        }
        return false;
      };

      return State;
    })();

    return new UserControl();
  })();

})();
