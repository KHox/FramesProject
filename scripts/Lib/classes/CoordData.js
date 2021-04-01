import { isNumeric } from "../Math-Lib.js";
import { Vec2 } from "./Vec2.js";

export class CoordsData extends Vec2 {
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

    set(x, y) {
        this.x = x;
        this.y = y;
    }
}