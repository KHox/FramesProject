import { isNumeric } from "../MathLib.js";
import { Vec2 } from "./Vec2.js";

export class CoordsData extends Vec2 {
    constructor(x = 0, y = 0, z = 0) {
        super(x, y);
        this.z = z;
    }

    get x() {
        return this._x;
    }

    set x(v) {
        if (isNumeric(v)) {
            this._x = v;
        }
    }

    get y() {
        return this._y;
    }

    set y(v) {
        if (isNumeric(v)) {
            this._y = v;
        }
    }

    get z() {
        return this._z;
    }

    set z(v) {
        if (isNumeric(v)) {
            this._z = v;
        }
    }

    set(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}