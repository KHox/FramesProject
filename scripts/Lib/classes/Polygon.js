import { Ray } from "./Ray.js";
import { Vec2 } from "./Vec2.js";

//One is one element width
export class Polygon {
    constructor(points) {
        if (points instanceof Array && points.length > 2) {
            let l = points.length;
            this._mainPoint = new Vec2(...points[0].valueOf());
            this._points = new Array(l);
            this._angles = new Array(l - 1);
            this._points[0] = this._mainPoint;
            for (let i = 1; i < l; i++) {
                const point = new Vec2(...points[i].valueOf());
                this._angles[i - 1] = point.minus(this._mainPoint).getAngle();
                this._points[i] = point;
            }
        } else {
            throw new TypeError('Array expected with at least three points');
        }
    }

    /**
     * @param {Ray} ray
    getCollideWithRay(ray) {

    }*/

    /**
     * @param {Polygon} poly 
     */
    isIntersection(poly) {

    }
}