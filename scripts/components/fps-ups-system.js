import { FrameRenderableComponent } from "../FrameSystem/index.js";

export class FpsUpsSystem extends FrameRenderableComponent {
    onOpen() {
        this._tickPriority = 999;
        this._renderPriority = 999;
        this._ups = this._fps = this._all = this._sec = 0;
        this._info = 'FPS: 0 UPS: 0 AVG: 0';
        this._avgUpdate = this._lastUpdate = this._frame.time.currentFrame;
    }
    
    tick() {
        this._ups++;
    }
    
    postRender() {
        this._fps++;

        if ((this._frame.time.currentFrame - this._lastUpdate) > 1000) {
            this._lastUpdate = this._frame.time.currentFrame;
            this.calcInfo();
            this._sec++;

            if (this._sec > 10) {
                this._sec = 0;
                this._avgUpdate = this._lastUpdate;
                this._all = 0;
            }
        }
        this._frame.ctx.fillStyle = 'lime';
        this._frame.ctx.fillText(this._info, 0, 0);
    }

    calcInfo() {
        this._all += this._ups;
        this._info = `FPS: ${this._fps} UPS: ${this._ups} AVG: ${(this._all / (this._lastUpdate - this._avgUpdate) * 1000).toFixed(2)}`;
        this._ups = this._fps = 0;
    }
}

customElements.define('fps-ups-system', FpsUpsSystem);