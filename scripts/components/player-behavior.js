import { RenderableFrameComponent } from "../frameComponentSystem/Frame.js";
import { isNumeric } from "../Lib/index.js";

export class PlayerBehavior extends RenderableFrameComponent {
    get x() {
        return this._x;
    }

    get y() {
        return this._y;
    }

    get a() {
        return this._a;
    }

    init() {
        this._map = this._frame.querySelector('pseudo-map');
        if (!(this._map instanceof RenderableFrameComponent)) {
            this._isActive = false;
            return;
        }

        this._moveSpeed = 4.5;
        this._sprintMul = 1.5;

        this._sens = 1e-3 / 3;

        this._x = this.getAttribute('x');
        if (!isNumeric(this._x)) {
            this._x = 1;
        }

        this._y = this.getAttribute('y');
        if (!isNumeric(this._y)) {
            this._y = 1;
        }

        this._a = this.getAttribute('a');
        if (!isNumeric(this._a)) {
            this._a = 0;
        }

        this._speed = {
            forward: 0,
            left: 0,
            right: 0,
            backward: 0
        };

        this._dy = this._dx = 0;
        this._isSprint = false;

        super.init();
    }

    onMouseMove(x, y) {
        if (!this._frame.isFullscreened) return;
        this._a += x * this._sens * this._frame.time.deltaTick;
        this.calcMovement();
    }

    onKeyDown(keys) {
        let isMoveKey = false;
        if (keys.ShiftLeft) {
            this._isSprint = true;
            isMoveKey = true;
        }

        if (keys.KeyW) {
            this._speed.forward = this._moveSpeed;
            isMoveKey = true;
        }
        if (keys.KeyS) {
            this._speed.backward = this._moveSpeed;
            isMoveKey = true;
        }
        if (keys.KeyA) {
            this._speed.left = this._moveSpeed;
            isMoveKey = true;
        }
        if (keys.KeyD) {
            this._speed.right = this._moveSpeed;
            isMoveKey = true;
        }

        if (isMoveKey) {
            this.calcMovement();
        }
    }

    onKeyUp(keys) {
        let isMoveKey = false;
        if (keys.ShiftLeft) {
            this._isSprint = false;
            isMoveKey = true;
        }

        if (keys.KeyW) {
            this._speed.forward = 0;
            isMoveKey = true;
        }
        if (keys.KeyS) {
            this._speed.backward = 0;
            isMoveKey = true;
        }
        if (keys.KeyA) {
            this._speed.left = 0;
            isMoveKey = true;
        }
        if (keys.KeyD) {
            this._speed.right = 0;
            isMoveKey = true;
        }

        if (isMoveKey) {
            this.calcMovement();
        }
    }

    calcMovement() {
        let forw = this._speed.forward - this._speed.backward;
        let lr = this._speed.right - this._speed.left;

        if (forw && lr) {
            forw /= Math.sqrt(2);
            lr /= Math.sqrt(2);
        }

        let sin = Math.sin(this._a);
		let cos = Math.cos(this._a);

        this._dx = (forw * cos - lr * sin);
        this._dy = (forw * sin + lr * cos);

        if (this._isSprint) {
            this._dx *= this._sprintMul;
            this._dy *= this._sprintMul;
        }
    }

    tick() {
        if (this._dx || this._dy) {
            this._map.canIMove(this, this._dx * this._frame.time.deltaTick / 1000, this._dy  * this._frame.time.deltaTick / 1000);
        }
    }

    moveBy(x, y) {
        this._x += x;
        this._y += y;
    }
}

customElements.define('player-behavior', PlayerBehavior);