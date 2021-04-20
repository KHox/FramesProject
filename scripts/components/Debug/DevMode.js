import { FrameRenderableComponent } from "../../FrameSystem/index.js";
import { DrawingMapSystem } from "../DrawingMapSystem/DrawingMapSystem.js";
import { CopyCoords } from "./CopyCoords.js";

export class DevMode extends FrameRenderableComponent {
    constructor() {
        super();
        this._renderPriority = 999;
    }

    onOpen() {
        /**
         * @type {DrawingMapSystem}
         */
        this._dms = this._frame.getComponents('DrawingMapSystem')[0];
        this.addComponents([new CopyCoords()]);
    }

    /**
     * @param {CanvasRenderingContext2D} ctx
     */
    postRender(ctx) {
        ctx.fillStyle = 'lime';
        ctx.textAlign = 'center';
        ctx.fillText(`Rendered Objects: ${this._dms.renderedCount}`, this._frame.centerX, 0);
    }
}

customElements.define('dev-mode', DevMode);