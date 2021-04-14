import { CoordsData } from "./CoordData.js";
import { Vec2 } from "./Vec2.js";

export class Transform {
    constructor(x = 0, y = 0, angle = 0) {
        this.rotation = angle;
        this._p = new CoordsData(x, y);
    }

    get position() {
        return this._p;
    }

    set position(v) {
        this._startChangeEvent();
        this._p.set(...v.valueOf());
    }

    get rotationMatrix() {
        return this._rm;
    }

    get rotation() {
        return this._angle;
    }

    set rotation(v) {
        this._startChangeEvent();
        this._angle = v;
        this._rm = Transform.getRotationMatrix(v);
    }

    set(x, y, rotation) {
        this._startChangeEvent();
        this._p.set(x, y);
        this.rotation = rotation;
    }

    setCallback(cb) {
        this._callback = cb;
    }

    valueOf() {
        return [this._a, this._b, this._c, this._d, this._p.x, this._p.y];
    }

    _startChangeEvent() {
        if (this._callback instanceof Function) {
            let result = {
                x: this._p.x,
                y: this._p.y,
                rotation: this._angle
            };
            queueMicrotask(() => {
                this._callback(result);
            });
        }
    }

    /**
     * @param {Vec2} point
     * @param {number} angle
     */
    rotateAroundPoint(point, angle) {

    }

    /**
     * @param {Vec2} point
     */
    lookAt(point) {
        this.rotation = -point.minus(this._p).getAngle();
    }

    static getRotationMatrix(angle) {
        let c = Math.cos(angle);
        let s = Math.sin(angle);
        return [c, -s, s, c];
    }

    static reverseMatrix(m) {
        return [m[0], m[2], m[1], m[3]];
    }
}