import { FrameRenderableComponent } from "../FrameSystem/index.js";

export class HelpInfo extends FrameRenderableComponent {
    constructor() {
        super();
        this._renderPriority = 999;
        this._helpInfo = `Use Q/E to rotate a camera\nWASD + Shift to move\nMouseDown starts drawing a ray/Mouse up ends drawing`;

        this._lines = this._helpInfo.split('\n');
    }

    postRender(ctx) {
        ctx.fillStyle = 'lime';
        ctx.textAlign = 'right';
        this._lines.forEach((l, i) => {
            ctx.fillText(l, this._frame.width, i * 15);
        })
    }
}

customElements.define('help-info', HelpInfo);