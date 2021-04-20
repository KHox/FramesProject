import { isNumeric } from "../MathLib.js";

export class Vec2 {
    constructor(x = 0, y = 0) {
        this._x = x;
        this._y = y;
    }

    get x() {
        return this._x;
    }

    get y() {
        return this._y;
    }

    get magnitude() {
        return Math.sqrt(this._x * this._x + this._y * this._y);
    }

    static get identy() {
        return new Vec2(0, 0);
    }

    static get up() {
        return new Vec2(0, -1);
    }

    static get left() {
        return new Vec2(-1, 0);
    }

    static get right() {
        return new Vec2(1, 0);
    }

    static get down() {
        return new Vec2(0, 1);
    }

    rotate(angle) {
        if (isNumeric(angle)) {
            const sin = Math.sin(angle);
            const cos = Math.cos(angle);

            return new Vec2(this._x * cos - this._y * sin, this._x * sin + this._y * cos);
        } else {
            throw new TypeError('Number expected');
        }
    }

    /**
     * @param {Vec2} vector 
     */
    plus(vector) {
        return new Vec2(this._x + vector.x, this._y + vector.y);
    }

    /**
     * @param {Vec2} vector 
     */
    minus(vector) {
        return new Vec2(this._x - vector.x, this._y - vector.y);
    }

    /**
     * @param {Vec2} vector 
     */
    dot(vector) {
        if (vector instanceof Vec2) {
            return vector.x * this._x + vector.y * this._y;
        }
        throw new TypeError('Vec2 expected');
    }

    /**
     * @param {Vec2} vector
     */
    getCosBetween(vector) {
        return this.dot(vector) / this.magnitude / vector.magnitude;
    }

    /**
     * @param {Vec2} vector 
     */
    angle(vector) {
        if (vector instanceof Vec2) {
            return Math.acos(this.getCosBetween(vector));
        }
        throw new TypeError('Vec2 expected');
    }

    /**
     * @param {number} n
     */
    mul(n) {
        if (isNumeric(n)) {
            return new Vec2(this._x * n, this._y * n);
        }
        throw new TypeError('Number expected');
    }

    normalize() {
        if (this._x || this._y) {
            return this.mul(1 / this.magnitude);
        } else {
            return this;
        }
    }

    valueOf() {
        return [this._x, this._y];
    }

    toJSON() {
        return {
            x: this.x,
            y: this.y
        };
    }

    cross(vector) {
        if (vector instanceof Vec2) {
            return this._x * vector.y - this._y * vector.x;
        } else {
            throw new TypeError('Vec2 expected');
        }
    }

    getAngle() {
        if (this._x || this._y) {
            let r = Math.atan(this._y / this._x);
            if (this._x < 0) {
                r += Math.PI;
            } else if (this._y < 0) {
                r += Math.PI * 2;
            }
            return r;
        } else {
            return 0;
        }
    }

    rotateByMatrix(rotM) {
        return new Vec2(rotM[0], rotM[1]).mul(this._x).plus(new Vec2(rotM[2], rotM[3]).mul(this._y));
    }

    reverse() {
        return new Vec2(-this._x, -this._y);
    }
}