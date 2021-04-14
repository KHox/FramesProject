import { FrameComponent } from "../Frame.js";

export class FrameRenderableComponent extends FrameComponent {
    constructor() {
        super();
        this._renderPriority = 1;
    }

    get renderPritority() {
        return this._renderPriority;
    }

    /**
     * @returns {object} Object that becomes the context (this) for render method
     */
    initRender() {}

    /**
     * Main calculating function
     * @param {object} data Object that method preRender returns
     * @returns {object} Object calculatedData for method postRender
     */
    render(data) {}

    /**
     * @returns {object} Object "data" for render method
     */
    preRender() {}

    /**
     * Main drawing method
     * @param {CanvasRenderingContext2D} ctx 
     * @param {object} calculatedData 
     */
    postRender(ctx, calculatedData) {}

    getRenderables() {
        let r = super.getRenderables();
        r.push(this);
        return r;
    }
}