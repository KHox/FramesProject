import { RenderableFrameComponent } from "../Frame.js";

export class FpsUpsSystem extends RenderableFrameComponent {
    init() {
        super.init();
        this._priority = 999;
        this._ups = this._fps = 0;
        this._info = 'FPS: 0 UPS: 0';
        this._lastUpdate = this._frame.time.currentFrame;
    }
    
    tick() {
        this._ups++;
    }
    
    postRender() {
        this._fps++;

        if ((this._frame.time.currentFrame - this._lastUpdate) > 1000) {
            this._info = `FPS: ${this._fps} UPS: ${this._ups}`;
            this._ups = this._fps = 0;
            this._lastUpdate = this._frame.time.currentFrame;
        }

        this._frame._ctx.fillStyle = 'lime';
        this._frame._ctx.fillText(this._info, 0, 0);
    }
}

customElements.define('fps-ups-system', FpsUpsSystem);