import { CoordsData } from "./CoordData.js";

export class Transform {
    constructor() {
        this._p = new CoordsData(0, 0);
        this._a = 0;
    }

    get position() {
        return this._p;
    }

    set position(v) {
        this._p.set(...v.valueOf());
    }

    get rotation() {
        return this._a;
    }

    set rotation(v) {
        this._a = v;
    }

    set(x, y, rotation) {
        this._p.set(x, y);
        this._a = rotation;
    }

    valueOf() {
        [this._p.x, this._p.y, this._a];
    }
}