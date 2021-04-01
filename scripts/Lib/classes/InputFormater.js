import { Vec2 } from "./Vec2.js";

export class InputFormater {
    constructor() {
        this.clear();
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

    clear() {
        this._f = this._b = this._l = this._r = 0;
    }

    getDirection() {
        return new Vec2(this._r - this._l, this._b - this._f).normalize();
    }
}