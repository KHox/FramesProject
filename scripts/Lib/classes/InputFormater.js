import { Vec2 } from "./Vec2.js";

export class InputFormater {
    constructor() {
        this.clear();
        this._fb = 'KeyW';
        this._bb = 'KeyS';
        this._lb = 'KeyA';
        this._rb = 'KeyD';
    }

    preset(forw, back, left, right, callback) {
        this._fb = forw;
        this._bb = back;
        this._lb = left;
        this._rb = right;
        this._callback = callback;
    }

    setCallback(callback) {
        this._callback = callback;
    }

    down(f, b, l, r) {
        if (f) {
            this._f = 1;
        }
        if (b) {
            this._b = 1;
        }
        if (l) {
            this._l = 1;
        }
        if (r) {
            this._r = 1;
        }

        return !!(f || b || l || r);
    }

    up(f, b, l, r) {
        if (f) {
            this._f = 0;
        }
        if (b) {
            this._b = 0;
        }
        if (l) {
            this._l = 0;
        }
        if (r) {
            this._r = 0;
        }

        return !!(f || b || l || r);
    }

    handleDown(e) {
        if (this.down(e[this._fb], e[this._bb], e[this._lb], e[this._rb]) && this._callback) {
            this._callback(this.getDirection());
        }
        return this;
    }

    handleUp(e) {
        if (this.up(e[this._fb], e[this._bb], e[this._lb], e[this._rb]) && this._callback) {
            this._callback(this.getDirection());
        }
        return this;
    }

    clear() {
        this._f = this._b = this._l = this._r = 0;
    }

    getDirection() {
        return new Vec2(this._r - this._l, this._b - this._f).normalize();
    }
}