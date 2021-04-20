import { Vec3Set } from "./Vec3Set.js";

export class Transform {
    constructor(x = 0, y = 0, z = 0, angle = 0) {
        this.rotation = angle;
        this._p = new Vec3Set(x, y, z);
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

    set(x, y, z, rotation) {
        this._startChangeEvent();
        this._p.set(x, y, z);
        this.rotation = rotation;
    }

    setCallback(cb) {
        this._callback = cb;
    }

    valueOf() {
        return [this._p.x, this._p.y, this._p.z, this._angle];
    }

    toJSON() {
        return {
            rotation: this._angle,
            x: this._p.x,
            y: this._p.y,
            z: this._p.z
        }
    }

    _startChangeEvent() {
        if (this._callback instanceof Function) {
            let result = {
                x: this._p.x,
                y: this._p.y,
                z: this._p.z,
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

    /**
     * @param {Vec2} point
     * @returns {Vec2}
     */
    translateFromWorld(point) {
        return point.minus(this._p).rotateByMatrix(this._rm);
    }

    /**
     * @param {Vec2} point
     * @returns {Vec2}
     */
    translateToWorld(point) {
        return this._p.plus(point.rotateByMatrix(Transform.reverseMatrix(this._rm)));
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