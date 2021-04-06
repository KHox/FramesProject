import { FrameComponent } from "../FrameSystem/index.js";
import { InputFormater, Vec2 } from "../Lib/index.js";
import { Object2D } from "./DrawingMapSystem/DrawingMapSystem.js";

export class DrivingByScreen extends FrameComponent {
    constructor() {
        super();
        this._moveChange = this._moveChange.bind(this);
        this._direction = Vec2.identy;

        this._inputFormater = new InputFormater();
        this._inputFormater.setCallback(this._moveChange);

        this._isDriving = false;
    }

    _moveChange(dir) {
        this._direction = dir;
    }

    /**
     * @param {Object2D} o2d 
     */
    drive(o2d) {

    }
}

customElements.define('driving-by-screen', DrivingByScreen);