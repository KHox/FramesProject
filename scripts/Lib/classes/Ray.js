import { Vec2 } from "./Vec2.js";

export class Ray {
    constructor(origin, direction) {
        if (origin instanceof Vec2 && direction instanceof Vec2) {
            this._o = origin;
            this._d = direction;
        } else {
            throw new TypeError(`Vec2's expectd`);
        }
    }

    static createByPoints(p1, p2) {
        return new Ray(p1, p2.minus(p1));
    }

    get origin() {
        return this._o;
    }

    get direction() {
        return this._d;
    }

    /**
     * @param {Ray} ray
     */
    getCollidePoint(ray) {
        // A = this._o;
        // B = this._o + this._d;
        // C = ray.origin;
        // D = ray.origni + ray.direction

        let ac = ray.origin.minus(this._o);
        let ad = ac.plus(ray.direction);
        
        let z1 = this._d.cross(ac);
        let z2 = this._d.cross(ad);

        if (z1 > 0 && z2 > 0 || z1 < 0 && z2 < 0) {
            return null;
        }

        let ca = this._o.minus(ray.origin);
        let cb = ca.plus(this._d);

        z1 = ray.direction.cross(ca);
        z2 = ray.direction.cross(cb);

        if (z1 > 0 && z2 > 0 || z1 < 0 && z2 < 0) {
            return null;
        }

        return this._o.plus(this._d.mul(z1 / (z1 - z2)));
    }
}