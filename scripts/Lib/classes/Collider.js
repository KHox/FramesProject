import { Ray } from "./Ray.js";
import { Vec2 } from "./Vec2.js";

//One is one element width
export class Collider {
    constructor(points) {
        if (points instanceof Array) {
            this._rays = points.map(p => new Vec2(...p.valueOf()));
        } else {
            throw new TypeError('Array expected');
        }
    }

    /**
     * @param {Ray} ray
     */
    getCollideWithRay(ray) {

    }
}