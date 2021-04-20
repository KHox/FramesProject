import { Vec2 } from "./Vec2.js";

export class Vec3 extends Vec2 {
    constructor(x = 0, y = 0, z = 0) {
        super(x, y);
        this._z = z;
    }

    get z() {
        return this._z;
    }

    get magnitude() {
        return Math.sqrt(this._x * this._x + this._y * this._y + this._z * this._z);
    }

    mul(v) {
        return new Vec3(this._x * v, this._y * v, this._z * v);
    }

    convert2() {
        return new Vec2(this._x, this._y);
    }

    valueOf() {
        return [this._x, this._y, this._z];
    }

    plus(vec) {
        return new Vec3(this._x + vec.x, this._y + vec.y, this._z + (vec.z || 0));
    }

    minus(vec) {
        return new Vec3(this._x - vec.x, this._y - vec.y, this._z - (vec.z || 0));
    }
}