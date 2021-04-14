import { FrameRenderableComponent } from "../FrameSystem/index.js";
import { Vec2 } from "../Lib/index.js";
import { DrawingMapSystem, Object2D } from "./DrawingMapSystem/DrawingMapSystem.js";

let id = 0;

export class ShipBehavior extends FrameRenderableComponent {
    constructor() {
        super();

        this._tId = null;

        /**
         * @type {Vec2}
         */
        this._p = null;

        this._fm = false;

        /*if (id == 0) {
            this.postRender = function() {
                if (this._p) {
                    this._dms.drawPoint(this._p, 'lime', true);
                }
            };

            id++;
        }*/

        this.onTouchStart = this.onTouchMove = this._onTouch = this._onTouch.bind(this);
        this.onMouseDown = this.onMouseMove = this.onMouseUp = this.onMouse = this.onMouse.bind(this);
    }
    
    onOpen() {
        /**
         * @type {Object2D}
         */
        this._ship = this._parent;
        /**
         * @type {DrawingMapSystem}
         */
        this._dms = this._frame.getComponents('DrawingMapSystem')[0];
    }
    
    onToggleScreen(mode) {
        if (mode && !this._p) {
            this._p = new Vec2(this._frame.centerX, this._frame.centerY);
        }
        this._fm = mode;
        console.log('toggle');
    }
    
    onMouse(data) {
        if (this._fm) {
            this._p = this._p.plus(new Vec2(data.dx || 0, data.dy || 0));
        } else {
            this._p = new Vec2(data.x, data.y);
        }
        this.rotateShipTo(this._p);
    }

    onTouchEnd(touches) {
        if (this._onTouch(touches)) {
            this._tId = null;
        }
    }

    onTouchCancel(touches) {
        if (touches.find(t => t.identifier == this._tId)) {
            this._tId = null;
        }
    }

    _onTouch(touches) {
        let t;
        if (this._tId == null) {
            t = touches[0];
            this._tId = t.identifier;
        } else {
            t = touches.find(t => t.identifier == this._tId);
        }
        if (t) {
            this._p = new Vec2(t.x, t.y);
            this.rotateShipTo(this._p);
            return t;
        }
        return null;
    }

    onCameraChanged() {
        if (this._p) {
            this.rotateShipTo(this._p);
        }
    }

    rotateShipTo(point) {
        this._ship.transform.lookAt(this._dms.screenToWorldMatrix(point));
    }
}

customElements.define('ship-behavior', ShipBehavior);