import { RenderableFrameComponent } from "../frameComponentSystem/Frame.js";

export class FpsUpsSystem extends RenderableFrameComponent {
    init() {
        super.init();
        this._priority = 999;
        this._ups = this._fps = this._all = 0;
        this._info = 'FPS: 0 UPS: 0 AVG: 0';
        this._firstUpdate = this._lastUpdate = this._frame.time.currentFrame;
    }
    
    tick() {
        this._ups++;
    }
    
    postRender() {
        this._fps++;

        if ((this._frame.time.currentFrame - this._lastUpdate) > 1000) {
                this.calcInfo();
            this._lastUpdate = this._frame.time.currentFrame;
        }

        this._frame._ctx.fillStyle = 'lime';
        this._frame._ctx.fillText(this._info, 0, 0);
    }

    calcInfo() {
        this._all += this._ups;
        this._info = `FPS: ${this._fps} UPS: ${this._ups} AVG: ${(this._all / (this._frame.time.currentFrame - this._firstUpdate) * 1000).toFixed(2)}`;
        this._ups = this._fps = 0;
    }
}

customElements.define('fps-ups-system', FpsUpsSystem);