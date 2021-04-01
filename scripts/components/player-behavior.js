import { FrameRenderableComponent } from "../FrameSystem/index.js";
import { InputFormater, isNumeric, Vec2 } from "../Lib/index.js";

export class PlayerBehavior extends FrameRenderableComponent {
    get x() {
        return this._x;
    }

    get y() {
        return this._y;
    }

    get a() {
        return this._a;
    }

    onOpen() {
        this._map = this._frame.getComponents('PseudoMap')[0];

        if (!(this._map instanceof FrameRenderableComponent)) {
            this.switchOff();
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

        this._IF = new InputFormater();
        this._direction = Vec2.identy;
        this._isSprint = false;
    }

    onMouseMove(x, y) {
        if (!this._frame.isFullscreened) return;
        this._a += x * this._sens * this._frame.time.deltaTick;
        this.calcMovement();
    }

    onKeyDown(keys) {
        if (this._IF.down(
            keys.KeyW,
            keys.KeyS,
            keys.KeyA,
            keys.KeyD
        )) {
            if (keys.ShiftLeft) {
                this._isSprint = true;
            }

            this.calcMovement();
        } else if (keys.ShiftLeft) {
            this._isSprint = true;
            this.calcMovement();
        }
    }

    onKeyUp(keys) {
        if (this._IF.up(
            keys.KeyW,
            keys.KeyS,
            keys.KeyA,
            keys.KeyD
        )) {
            if (keys.ShiftLeft) {
                this._isSprint = false;
            }

            this.calcMovement();
        } else if (keys.ShiftLeft) {
            this._isSprint = false;
            this.calcMovement();
        }
    }

    calcMovement() {
        let dir = this._IF.getDirection().mul(this._moveSpeed).rotate(this._a + Math.PI / 2);

        if (this._isSprint) {
            this._direction = dir.mul(this._sprintMul);
        } else {
            this._direction = dir;
        }
    }

    tick() {
        if (this._direction.x || this._direction.y) {
            this._map.canIMove(this, this._direction.x * this._frame.time.deltaTick / 1000, this._direction.y  * this._frame.time.deltaTick / 1000);
        }
    }

    moveBy(x, y) {
        this._x += x;
        this._y += y;
    }

    onBlur() {
        this._IF.clear();
        this._direction = Vec2.identy;
    }
}

customElements.define('player-behavior', PlayerBehavior);