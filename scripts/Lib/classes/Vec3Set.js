import { Vec3 } from "./Vec3.js";

export class Vec3Set extends Vec3 {
    get x() {
        return this._x;
    }

    set x(v) {
        this._x = v;
    }

    get y() {
        return this._y;
    }

    set y(v) {
        this._y = v;
    }

    get z() {
        return this._z;
    }

    set z(v) {
        this._z = v;
    }

    set(x, y, z = this._z) {
        this._x = x;
        this._y = y;
        this._z = z;
    }
}